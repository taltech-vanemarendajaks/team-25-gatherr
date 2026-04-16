package com.gatherr.backend.service;

import com.gatherr.backend.dto.RespondDto;
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

@Service
public class AvailabilityService {

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
}
