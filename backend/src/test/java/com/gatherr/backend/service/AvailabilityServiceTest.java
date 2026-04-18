package com.gatherr.backend.service;

import com.gatherr.backend.dto.EventSummaryDto;
import com.gatherr.backend.dto.RespondDto;
import com.gatherr.backend.model.Event;
import com.gatherr.backend.model.EventUser;
import com.gatherr.backend.model.User;
import com.gatherr.backend.repository.EventRepository;
import com.gatherr.backend.repository.EventUserRepository;
import com.gatherr.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AvailabilityServiceTest {

    @Mock
    private EventRepository eventRepository;

    @Mock
    private EventUserRepository eventUserRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AvailabilityService availabilityService;

    private static final Long USER_ID = 1L;
    private static final String SHORT_ID = "some-event-123";

    private Event event;
    private User user;
    private RespondDto dto;

    @BeforeEach
    void setUp() {
        event = new Event();
        event.setId(10L);
        event.setShortId(SHORT_ID);
        event.setDeleted(false);

        user = new User();
        user.setId(USER_ID);

        dto = new RespondDto(
                List.of("2025-06-01T09:00"),
                List.of("2025-06-01T10:00"),
                "Europe/Tallinn"
        );
    }

    @Test
    void respond_returnsNotFound_whenEventDoesNotExist() {
        when(eventRepository.findByShortId(SHORT_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> availabilityService.respond(USER_ID, SHORT_ID, dto))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("404");
    }

    @Test
    void respond_returnsNotFound_whenEventIsDeleted() {
        event.setDeleted(true);
        when(eventRepository.findByShortId(SHORT_ID)).thenReturn(Optional.of(event));

        assertThatThrownBy(() -> availabilityService.respond(USER_ID, SHORT_ID, dto))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("404");
    }

    @Test
    void respond_createsNewEventUser_onFirstSubmission() {
        when(eventRepository.findByShortId(SHORT_ID)).thenReturn(Optional.of(event));
        when(eventUserRepository.findByEventShortIdAndUserId(SHORT_ID, USER_ID)).thenReturn(Optional.empty());
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));
        when(eventUserRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        availabilityService.respond(USER_ID, SHORT_ID, dto);

        ArgumentCaptor<EventUser> captor = ArgumentCaptor.forClass(EventUser.class);
        verify(eventUserRepository).save(captor.capture());
        EventUser saved = captor.getValue();

        assertThat(saved.getEvent()).isEqualTo(event);
        assertThat(saved.getUser()).isEqualTo(user);
        assertThat(saved.getAvailable()).isEqualTo(dto.available());
        assertThat(saved.getNotAvailable()).isEqualTo(dto.notAvailable());
        assertThat(saved.getTimezone()).isEqualTo("Europe/Tallinn");
    }

    @Test
    void respond_replacesAvailability_onSubsequentSubmission() {
        EventUser existing = new EventUser();
        existing.setAvailable(List.of("old-slot"));
        existing.setNotAvailable(List.of());
        existing.setTimezone("UTC");

        when(eventRepository.findByShortId(SHORT_ID)).thenReturn(Optional.of(event));
        when(eventUserRepository.findByEventShortIdAndUserId(SHORT_ID, USER_ID)).thenReturn(Optional.of(existing));
        when(eventUserRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        availabilityService.respond(USER_ID, SHORT_ID, dto);

        ArgumentCaptor<EventUser> captor = ArgumentCaptor.forClass(EventUser.class);
        verify(eventUserRepository).save(captor.capture());
        EventUser saved = captor.getValue();

        assertThat(saved.getAvailable()).isEqualTo(dto.available());
        assertThat(saved.getNotAvailable()).isEqualTo(dto.notAvailable());
        assertThat(saved.getTimezone()).isEqualTo("Europe/Tallinn");
        verify(userRepository, never()).findById(any());
    }

    @Test
    void respond_savesEmptyLists_whenUserSubmitsNoSlots() {
        RespondDto emptyDto = new RespondDto(List.of(), List.of(), "Europe/Tallinn");

        when(eventRepository.findByShortId(SHORT_ID)).thenReturn(Optional.of(event));
        when(eventUserRepository.findByEventShortIdAndUserId(SHORT_ID, USER_ID)).thenReturn(Optional.empty());
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));
        when(eventUserRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        availabilityService.respond(USER_ID, SHORT_ID, emptyDto);

        ArgumentCaptor<EventUser> captor = ArgumentCaptor.forClass(EventUser.class);
        verify(eventUserRepository).save(captor.capture());
        EventUser saved = captor.getValue();

        assertThat(saved.getAvailable()).isEmpty();
        assertThat(saved.getNotAvailable()).isEmpty();
        assertThat(saved.getTimezone()).isEqualTo("Europe/Tallinn");
    }

    @Test
    void respond_preservesEventReference_onUpdate() {
        Event originalEvent = new Event();
        originalEvent.setId(10L);
        originalEvent.setShortId(SHORT_ID);
        originalEvent.setDeleted(false);

        EventUser existing = new EventUser();
        existing.setEvent(originalEvent);
        existing.setUser(user);
        existing.setAvailable(List.of("old"));
        existing.setNotAvailable(List.of());
        existing.setTimezone("UTC");

        when(eventRepository.findByShortId(SHORT_ID)).thenReturn(Optional.of(event));
        when(eventUserRepository.findByEventShortIdAndUserId(SHORT_ID, USER_ID)).thenReturn(Optional.of(existing));
        when(eventUserRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        availabilityService.respond(USER_ID, SHORT_ID, dto);

        ArgumentCaptor<EventUser> captor = ArgumentCaptor.forClass(EventUser.class);
        verify(eventUserRepository).save(captor.capture());
        EventUser saved = captor.getValue();

        assertThat(saved.getEvent()).isSameAs(originalEvent);
        assertThat(saved.getUser()).isSameAs(user);
    }

    @Test
    void respond_returnsNotFound_whenUserFromTokenDoesNotExist_onFirstSubmission() {
        when(eventRepository.findByShortId(SHORT_ID)).thenReturn(Optional.of(event));
        when(eventUserRepository.findByEventShortIdAndUserId(SHORT_ID, USER_ID)).thenReturn(Optional.empty());
        when(userRepository.findById(USER_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> availabilityService.respond(USER_ID, SHORT_ID, dto))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("404");

        verify(eventUserRepository, never()).save(any());
    }

    @Test
    void getSummary_returnsNotFound_whenEventDoesNotExist() {
        when(eventRepository.findByShortId(SHORT_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> availabilityService.getSummary(SHORT_ID))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("404");
    }

    @Test
    void getSummary_returnsNotFound_whenEventIsDeleted() {
        event.setDeleted(true);
        when(eventRepository.findByShortId(SHORT_ID)).thenReturn(Optional.of(event));

        assertThatThrownBy(() -> availabilityService.getSummary(SHORT_ID))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("404");
    }

    @Test
    void getSummary_includesAllEventSlots_evenWithZeroResponses() {
        event.setTimezone("Europe/Tallinn");
        event.setTimes(List.of("0700-10042026", "0730-10042026"));
        when(eventRepository.findByShortId(SHORT_ID)).thenReturn(Optional.of(event));
        when(eventUserRepository.findByEventShortId(SHORT_ID)).thenReturn(List.of());

        EventSummaryDto summary = availabilityService.getSummary(SHORT_ID);

        assertThat(summary.users()).isEmpty();
        assertThat(summary.slots()).hasSize(2);
        assertThat(summary.slots().get(0).slot()).isEqualTo("0700-10042026");
        assertThat(summary.slots().get(0).count()).isZero();
        assertThat(summary.slots().get(0).users()).isEmpty();
        assertThat(summary.slots().get(1).slot()).isEqualTo("0730-10042026");
        assertThat(summary.slots().get(1).count()).isZero();
    }

    @Test
    void getSummary_countsUsersPerSlot_sameTimezone() {
        event.setTimezone("Europe/Tallinn");
        event.setTimes(List.of("1030-08042026", "0830-13042026", "1430-12042026"));

        User alice = new User();
        alice.setId(1L);
        alice.setName("Alice Müller");
        alice.setProfilePicture("https://example.com/alice.png");

        User cody = new User();
        cody.setId(2L);
        cody.setName("Cody Medhurst");
        cody.setProfilePicture("https://example.com/cody.png");

        EventUser aliceEu = new EventUser();
        aliceEu.setUser(alice);
        aliceEu.setTimezone("Europe/Tallinn");
        aliceEu.setAvailable(List.of("1030-08042026", "0830-13042026"));
        aliceEu.setNotAvailable(List.of("1830-13042026"));

        EventUser codyEu = new EventUser();
        codyEu.setUser(cody);
        codyEu.setTimezone("Europe/Tallinn");
        codyEu.setAvailable(List.of("1430-12042026", "0830-13042026"));
        codyEu.setNotAvailable(List.of("0230-15042026"));

        when(eventRepository.findByShortId(SHORT_ID)).thenReturn(Optional.of(event));
        when(eventUserRepository.findByEventShortId(SHORT_ID)).thenReturn(List.of(aliceEu, codyEu));

        EventSummaryDto summary = availabilityService.getSummary(SHORT_ID);

        assertThat(summary.users()).hasSize(2);
        assertThat(summary.users().get(0).user().id()).isEqualTo(1L);
        assertThat(summary.users().get(0).user().name()).isEqualTo("Alice Müller");
        assertThat(summary.users().get(0).user().profilePicture()).isEqualTo("https://example.com/alice.png");
        assertThat(summary.users().get(0).available()).containsExactly("1030-08042026", "0830-13042026");
        assertThat(summary.users().get(0).notAvailable()).containsExactly("1830-13042026");

        assertThat(summary.slots()).hasSize(3);
        assertThat(summary.slots().get(0).slot()).isEqualTo("1030-08042026");
        assertThat(summary.slots().get(0).count()).isEqualTo(1);
        assertThat(summary.slots().get(0).users()).extracting("id").containsExactly(1L);

        assertThat(summary.slots().get(1).slot()).isEqualTo("0830-13042026");
        assertThat(summary.slots().get(1).count()).isEqualTo(2);
        assertThat(summary.slots().get(1).users()).extracting("id").containsExactly(1L, 2L);

        assertThat(summary.slots().get(2).slot()).isEqualTo("1430-12042026");
        assertThat(summary.slots().get(2).count()).isEqualTo(1);
        assertThat(summary.slots().get(2).users()).extracting("id").containsExactly(2L);
    }

    @Test
    void getSummary_normalizesSlotsAcrossTimezones() {
        // Event timezone is Europe/Tallinn (UTC+3 in summer).
        // Event slot "0700-10042026" means 07:00 on 10 April 2026 in Tallinn.
        // A user in Europe/Amsterdam (UTC+2) expressing the SAME instant would
        // submit "0600-10042026" — this must be counted as available at the Tallinn slot.
        event.setTimezone("Europe/Tallinn");
        event.setTimes(List.of("0700-10042026"));

        User amsterdamUser = new User();
        amsterdamUser.setId(5L);
        amsterdamUser.setName("Amsterdam Alice");

        EventUser eu = new EventUser();
        eu.setUser(amsterdamUser);
        eu.setTimezone("Europe/Amsterdam");
        eu.setAvailable(List.of("0600-10042026"));
        eu.setNotAvailable(Collections.emptyList());

        when(eventRepository.findByShortId(SHORT_ID)).thenReturn(Optional.of(event));
        when(eventUserRepository.findByEventShortId(SHORT_ID)).thenReturn(List.of(eu));

        EventSummaryDto summary = availabilityService.getSummary(SHORT_ID);

        assertThat(summary.slots()).hasSize(1);
        assertThat(summary.slots().get(0).count()).isEqualTo(1);
        assertThat(summary.slots().get(0).users()).extracting("id").containsExactly(5L);
        assertThat(summary.users().get(0).available()).containsExactly("0600-10042026");
    }

    @Test
    void getSummary_fallsBackToEventTimezone_whenUserTimezoneIsNull() {
        event.setTimezone("Europe/Tallinn");
        event.setTimes(List.of("0700-10042026"));

        User u = new User();
        u.setId(3L);
        u.setName("No Timezone User");

        EventUser eu = new EventUser();
        eu.setUser(u);
        eu.setTimezone(null);
        eu.setAvailable(List.of("0700-10042026"));
        eu.setNotAvailable(Collections.emptyList());

        when(eventRepository.findByShortId(SHORT_ID)).thenReturn(Optional.of(event));
        when(eventUserRepository.findByEventShortId(SHORT_ID)).thenReturn(List.of(eu));

        EventSummaryDto summary = availabilityService.getSummary(SHORT_ID);

        assertThat(summary.slots().get(0).count()).isEqualTo(1);
        assertThat(summary.slots().get(0).users()).extracting("id").containsExactly(3L);
    }

    @Test
    void getSummary_doesNotMatchSlotsAtDifferentInstants() {
        event.setTimezone("Europe/Tallinn");
        event.setTimes(List.of("0700-10042026"));

        User u = new User();
        u.setId(9L);
        u.setName("Other");

        EventUser eu = new EventUser();
        eu.setUser(u);
        eu.setTimezone("Europe/Tallinn");
        eu.setAvailable(List.of("0800-10042026"));
        eu.setNotAvailable(Collections.emptyList());

        when(eventRepository.findByShortId(SHORT_ID)).thenReturn(Optional.of(event));
        when(eventUserRepository.findByEventShortId(SHORT_ID)).thenReturn(List.of(eu));

        EventSummaryDto summary = availabilityService.getSummary(SHORT_ID);

        assertThat(summary.slots().get(0).count()).isZero();
        assertThat(summary.slots().get(0).users()).isEmpty();
    }
}
