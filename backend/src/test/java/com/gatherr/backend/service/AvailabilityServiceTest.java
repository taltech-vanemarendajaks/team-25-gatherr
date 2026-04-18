package com.gatherr.backend.service;

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
}
