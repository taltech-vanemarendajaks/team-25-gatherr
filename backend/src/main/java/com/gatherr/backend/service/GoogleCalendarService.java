package com.gatherr.backend.service;

import com.gatherr.backend.dto.calendar.BusySlotsDto;
import com.gatherr.backend.dto.calendar.CalendarListDto;
import com.gatherr.backend.dto.calendar.CalendarSummaryDto;
import com.gatherr.backend.model.Event;
import com.gatherr.backend.model.User;
import com.gatherr.backend.model.UserGoogleToken;
import com.gatherr.backend.repository.EventRepository;
import com.gatherr.backend.repository.UserGoogleTokenRepository;
import com.gatherr.backend.repository.UserRepository;
import com.google.api.client.auth.oauth2.TokenResponse;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.googleapis.auth.oauth2.GoogleRefreshTokenRequest;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.CalendarScopes;
import com.google.api.services.calendar.model.CalendarListEntry;
import com.google.api.services.calendar.model.Events;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class GoogleCalendarService {
    private static final GsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();
    private static final String APPLICATION_NAME = "Gatherr";
    private static final DateTimeFormatter SLOT_DATE_FMT = DateTimeFormatter.ofPattern("ddMMyyyy");

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String clientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
    private String clientSecret;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Value("${app.base-url:http://localhost:8080/api/v1}")
    private String baseUrl;

    private final UserRepository userRepository;
    private final UserGoogleTokenRepository tokenRepository;
    private final EventRepository eventRepository;

    /**
     * Builds the Google consent-screen URL requesting calendar.readonly scope.
     * The frontend redirects the user to this URL.
     */
    public String buildAuthorizationUrl() throws GeneralSecurityException, IOException {
        return buildFlow()
                .newAuthorizationUrl()
                .setRedirectUri(baseUrl + "/auth/google/calendar/callback")
                .setAccessType("offline")   // request a refresh token
                .setApprovalPrompt("force") // force consent so refresh token is always returned
                .build();
    }

    /**
     * Exchanges the authorization code for access + refresh tokens and persists them.
     * Called from the OAuth callback endpoint.
     */
    @Transactional
    public void handleCallback(Long userId, String code) throws GeneralSecurityException, IOException {
        TokenResponse response = buildFlow()
                .newTokenRequest(code)
                .setRedirectUri(baseUrl + "/auth/google/calendar/callback")
                .execute();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        UserGoogleToken token = tokenRepository.findByUserId(userId)
                .orElseGet(() -> UserGoogleToken.builder().user(user).build());

        token.setAccessToken(response.getAccessToken());
        if (response.getRefreshToken() != null) {
            token.setRefreshToken(response.getRefreshToken());
        }
        token.setExpiresAt(OffsetDateTime.now().plusSeconds(response.getExpiresInSeconds()));

        tokenRepository.save(token);
        log.info("[GoogleCalendar] Stored tokens for userId={}", userId);
    }

    @Transactional
    public void revokeAccess(Long userId) {
        tokenRepository.deleteByUserId(userId);
        log.info("[GoogleCalendar] Revoked calendar access for userId={}", userId);
    }

    public CalendarListDto listCalendars(Long userId) throws GeneralSecurityException, IOException {
        Calendar service = buildCalendarService(userId);
        List<CalendarListEntry> entries = service.calendarList().list()
                .setMinAccessRole("reader")
                .execute()
                .getItems();

        List<CalendarSummaryDto> summaries = entries == null ? List.of() : entries.stream()
                .map(e -> new CalendarSummaryDto(e.getId(), e.getSummary()))
                .toList();

        return new CalendarListDto(summaries);
    }

    /**
     * Fetches events from the selected calendars for the Gatherr event's date range,
     * then maps occupied time windows to the app's slot format ("HHMM-DDMMYYYY").
     *
     * Only slots that exist in the event's own {@code times} list are returned,
     * so the result is always a valid subset of the event's candidate slots.
     */
    public BusySlotsDto getBusySlots(Long userId, String shortId, List<String> calendarIds)
            throws GeneralSecurityException, IOException {

        Event event = eventRepository.findByShortId(shortId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found: " + shortId));

        // Determine date range from the event's slot list
        DateRange range = resolveDateRange(event.getTimes());
        if (range == null) return new BusySlotsDto(List.of());

        Calendar service = buildCalendarService(userId);

        // Collect all Google Calendar event time windows across selected calendars
        List<TimeWindow> busyWindows = new ArrayList<>();
        for (String calendarId : calendarIds) {
            Events result = service.events().list(calendarId)
                    .setTimeMin(toGoogleDateTime(range.start().atStartOfDay(ZoneOffset.UTC)))
                    .setTimeMax(toGoogleDateTime(range.end().plusDays(1).atStartOfDay(ZoneOffset.UTC)))
                    .setSingleEvents(true)
                    .setOrderBy("startTime")
                    .execute();

            if (result.getItems() == null) continue;
            for (com.google.api.services.calendar.model.Event gcalEvent : result.getItems()) {
                TimeWindow window = extractWindow(gcalEvent);
                if (window != null) busyWindows.add(window);
            }
        }

        // Match busy windows against the event's candidate slots
        Set<String> eventSlots = new java.util.HashSet<>(event.getTimes());
        List<String> busySlots = event.getTimes().stream()
                .filter(slot -> eventSlots.contains(slot) && isSlotBusy(slot, event.getTimeIncrement(), busyWindows))
                .toList();

        return new BusySlotsDto(busySlots);
    }
    
    /**
     * Returns a valid access token for the user, refreshing it first if it has expired.
     */
    @Transactional
    public String getValidAccessToken(Long userId) throws IOException {
        UserGoogleToken token = tokenRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalStateException("No Google Calendar access for userId=" + userId));

        if (OffsetDateTime.now().isBefore(token.getExpiresAt().minusMinutes(1))) {
            return token.getAccessToken();
        }

        // Token expired — refresh it
        if (token.getRefreshToken() == null) {
            throw new IllegalStateException("Access token expired and no refresh token available for userId=" + userId);
        }

        TokenResponse refreshed = new GoogleRefreshTokenRequest(
                new NetHttpTransport(),
                JSON_FACTORY,
                token.getRefreshToken(),
                clientId,
                clientSecret
        ).execute();

        token.setAccessToken(refreshed.getAccessToken());
        token.setExpiresAt(OffsetDateTime.now().plusSeconds(refreshed.getExpiresInSeconds()));
        if (refreshed.getRefreshToken() != null) {
            token.setRefreshToken(refreshed.getRefreshToken());
        }
        tokenRepository.save(token);

        log.info("[GoogleCalendar] Refreshed access token for userId={}", userId);
        return token.getAccessToken();
    }

    // -------------------------------------------------------------------------
    // Helpers — slot/time conversion
    // -------------------------------------------------------------------------

    /** Parses "HHMM-DDMMYYYY" into a LocalDateTime. */
    private LocalDateTime parseSlot(String slot) {
        // slot = "0930-26042026"
        int hour   = Integer.parseInt(slot.substring(0, 2));
        int minute = Integer.parseInt(slot.substring(2, 4));
        // date part starts after the dash at index 5
        LocalDate date = LocalDate.parse(slot.substring(5), SLOT_DATE_FMT);
        return date.atTime(hour, minute);
    }

    /** Returns true if the slot's time window overlaps any busy window. */
    private boolean isSlotBusy(String slot, int incrementMinutes, List<TimeWindow> busyWindows) {
        LocalDateTime slotStart = parseSlot(slot);
        LocalDateTime slotEnd   = slotStart.plusMinutes(incrementMinutes);
        for (TimeWindow window : busyWindows) {
            // Overlap: slot starts before window ends AND slot ends after window starts
            if (slotStart.isBefore(window.end()) && slotEnd.isAfter(window.start())) {
                return true;
            }
        }
        return false;
    }

    /** Extracts the earliest and latest dates covered by the slot list. */
    private DateRange resolveDateRange(List<String> slots) {
        if (slots == null || slots.isEmpty()) return null;
        LocalDate min = null, max = null;
        for (String slot : slots) {
            LocalDate date = LocalDate.parse(slot.substring(5), SLOT_DATE_FMT);
            if (min == null || date.isBefore(min)) min = date;
            if (max == null || date.isAfter(max))  max = date;
        }
        return new DateRange(min, max);
    }

    private com.google.api.client.util.DateTime toGoogleDateTime(ZonedDateTime zdt) {
        return new com.google.api.client.util.DateTime(zdt.toInstant().toEpochMilli());
    }

    /** Extracts a start/end window from a Google Calendar event (handles all-day events). */
    private TimeWindow extractWindow(com.google.api.services.calendar.model.Event gcalEvent) {
        com.google.api.services.calendar.model.EventDateTime start = gcalEvent.getStart();
        com.google.api.services.calendar.model.EventDateTime end   = gcalEvent.getEnd();
        if (start == null || end == null) return null;

        LocalDateTime startDt, endDt;
        if (start.getDateTime() != null) {
            // Timed event
            startDt = LocalDateTime.ofInstant(Instant.ofEpochMilli(start.getDateTime().getValue()), ZoneOffset.UTC);
            endDt   = LocalDateTime.ofInstant(Instant.ofEpochMilli(end.getDateTime().getValue()),   ZoneOffset.UTC);
        } else if (start.getDate() != null) {
            // All-day event
            startDt = LocalDate.parse(start.getDate().toStringRfc3339()).atStartOfDay();
            endDt   = LocalDate.parse(end.getDate().toStringRfc3339()).atStartOfDay();
        } else {
            return null;
        }
        return new TimeWindow(startDt, endDt);
    }

    private GoogleAuthorizationCodeFlow buildFlow() throws GeneralSecurityException, IOException {
        GoogleClientSecrets.Details details = new GoogleClientSecrets.Details()
                .setClientId(clientId)
                .setClientSecret(clientSecret);
        GoogleClientSecrets secrets = new GoogleClientSecrets().setInstalled(details);

        return new GoogleAuthorizationCodeFlow.Builder(
                new NetHttpTransport(),
                JSON_FACTORY,
                secrets,
                List.of(CalendarScopes.CALENDAR_READONLY)
        ).build();
    }

    private Calendar buildCalendarService(Long userId) throws GeneralSecurityException, IOException {
        String accessToken = getValidAccessToken(userId);
        com.google.api.client.auth.oauth2.Credential credential =
                new com.google.api.client.auth.oauth2.Credential(
                        com.google.api.client.auth.oauth2.BearerToken.authorizationHeaderAccessMethod()
                ).setAccessToken(accessToken);

        return new Calendar.Builder(
                new NetHttpTransport(),
                JSON_FACTORY,
                credential
        ).setApplicationName(APPLICATION_NAME).build();
    }

    private record TimeWindow(LocalDateTime start, LocalDateTime end) {}
    private record DateRange(LocalDate start, LocalDate end) {}
}