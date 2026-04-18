package com.gatherr.backend.service;

import com.gatherr.backend.dto.EventSummaryDto;
import com.gatherr.backend.dto.EventUserDto;
import com.gatherr.backend.dto.RespondDto;
import com.gatherr.backend.dto.SlotSummaryDto;
import com.gatherr.backend.dto.SlotUserDto;
import com.gatherr.backend.model.Event;
import com.gatherr.backend.model.EventUser;
import com.gatherr.backend.model.User;
import com.gatherr.backend.repository.EventRepository;
import com.gatherr.backend.repository.EventUserRepository;
import com.gatherr.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class AvailabilityService {

    private static final DateTimeFormatter SLOT_FORMAT =
            DateTimeFormatter.ofPattern("HHmm-ddMMyyyy");

    private final EventRepository eventRepository;
    private final EventUserRepository eventUserRepository;
    private final UserRepository userRepository;

    public AvailabilityService(
            EventRepository eventRepository,
            EventUserRepository eventUserRepository,
            UserRepository userRepository
    ) {
        this.eventRepository = eventRepository;
        this.eventUserRepository = eventUserRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public void respond(Long userId, String shortId, RespondDto dto) {
        Event event = eventRepository.findByShortId(shortId)
                .filter(e -> !e.isDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));

        EventUser eventUser = eventUserRepository
                .findByEventShortIdAndUserId(shortId, userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
                    EventUser eu = new EventUser();
                    eu.setEvent(event);
                    eu.setUser(user);
                    return eu;
                });

        eventUser.setAvailable(dto.available());
        eventUser.setNotAvailable(dto.notAvailable());
        eventUser.setTimezone(dto.timezone());

        eventUserRepository.save(eventUser);
    }

    @Transactional(readOnly = true)
    public EventSummaryDto getSummary(String shortId) {
        Event event = eventRepository.findByShortId(shortId)
                .filter(e -> !e.isDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));

        List<EventUser> eventUsers = eventUserRepository.findByEventShortId(shortId);
        if (event.getTimezone() == null) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Event has no timezone configured");
        }
        ZoneId eventZone = ZoneId.of(event.getTimezone());

        List<EventUserDto> users = new ArrayList<>(eventUsers.size());
        List<Set<String>> normalizedAvailableByUser = new ArrayList<>(eventUsers.size());

        for (EventUser eu : eventUsers) {
            User u = eu.getUser();
            List<String> available = eu.getAvailable() != null ? eu.getAvailable() : Collections.emptyList();
            List<String> notAvailable = eu.getNotAvailable() != null ? eu.getNotAvailable() : Collections.emptyList();

            users.add(new EventUserDto(
                    new EventUserDto.UserInfo(u.getId(), u.getName(), u.getProfilePicture()),
                    available,
                    notAvailable
            ));

            ZoneId userZone = eu.getTimezone() != null ? ZoneId.of(eu.getTimezone()) : eventZone;
            Set<String> normalized = new HashSet<>();
            for (String slot : available) {
                normalized.add(normalizeSlot(slot, userZone, eventZone));
            }
            normalizedAvailableByUser.add(normalized);
        }

        List<String> eventTimes = event.getTimes() != null ? event.getTimes() : Collections.emptyList();
        List<SlotSummaryDto> slots = new ArrayList<>(eventTimes.size());
        for (String slot : eventTimes) {
            List<SlotUserDto> slotUsers = new ArrayList<>();
            for (int i = 0; i < eventUsers.size(); i++) {
                if (normalizedAvailableByUser.get(i).contains(slot)) {
                    User u = eventUsers.get(i).getUser();
                    slotUsers.add(new SlotUserDto(u.getId(), u.getName()));
                }
            }
            slots.add(new SlotSummaryDto(slot, slotUsers.size(), slotUsers));
        }

        return new EventSummaryDto(users, slots);
    }

    private static String normalizeSlot(String slot, ZoneId from, ZoneId to) {
        LocalDateTime local = LocalDateTime.parse(slot, SLOT_FORMAT);
        ZonedDateTime converted = local.atZone(from).withZoneSameInstant(to);
        return converted.format(SLOT_FORMAT);
    }
}
