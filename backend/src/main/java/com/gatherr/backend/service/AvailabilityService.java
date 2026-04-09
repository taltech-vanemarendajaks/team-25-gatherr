package com.gatherr.backend.service;

import com.gatherr.backend.dto.RespondDto;
import com.gatherr.backend.model.Event;
import com.gatherr.backend.model.EventUser;
import com.gatherr.backend.repository.EventRepository;
import com.gatherr.backend.repository.EventUserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class AvailabilityService {

    private final EventRepository eventRepository;
    private final EventUserRepository eventUserRepository;

    public AvailabilityService(
            EventRepository eventRepository,
            EventUserRepository eventUserRepository
    ) {
        this.eventRepository = eventRepository;
        this.eventUserRepository = eventUserRepository;
    }

    @Transactional
    public void respond(Long userId, String shortId, RespondDto<?> dto) {

        // Load event by shortId (return 404 if not found)
        Event event = (Event) eventRepository
                .findByShortId(shortId)
                .orElseThrow(() -> new EventNotFoundException("Event not found for shortId: " + shortId));

        // Find existing EventUser for (event, user)
        Optional<EventUser> existing = eventUserRepository
                .findByEventShortIdAndUserId(shortId, userId);

        // If exists update it, if not create a new row
        EventUser eventUser;
        if (existing.isPresent()) {
            eventUser = existing.get();
        } else {
            eventUser = new EventUser();
            eventUser.setEvent(event);
        }

        // Store available, notAvailable, and timezone from the request
        eventUser.setAvailable(dto.available());
        eventUser.setNotAvailable(dto.notAvailable());
        eventUser.setTimezone(dto.timezone());

        // Save and return 200
        eventUserRepository.save(eventUser);
    }

    // 404 exception
    public static class EventNotFoundException extends RuntimeException {
        public EventNotFoundException(String message) {
            super(message);
        }
    }
}