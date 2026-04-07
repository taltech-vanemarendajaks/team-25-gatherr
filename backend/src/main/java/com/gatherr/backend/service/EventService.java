package com.gatherr.backend.service;

import com.gatherr.backend.dto.CreateEventDto;
import com.gatherr.backend.dto.EventResponseDto;
import com.gatherr.backend.model.Event;
import com.gatherr.backend.model.EventUser;
import com.gatherr.backend.model.User;
import com.gatherr.backend.repository.EventRepository;
import com.gatherr.backend.repository.EventUserRepository;
import com.gatherr.backend.repository.UserRepository;
import com.gatherr.backend.util.WordConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final EventUserRepository eventUserRepository;
    private final UserRepository userRepository;

    @Transactional
    public EventResponseDto createEvent(Long creatorId, CreateEventDto dto) {

        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + creatorId));

        Event event = new Event();
        event.setName(dto.getName());
        event.setDescription(dto.getDescription());
        event.setType(dto.getType());
        event.setTimes(dto.getTimes());
        event.setTimezone(dto.getTimezone());
        event.setShortId(generateUniqueShortId());
        event.setCreator(creator);

        Event savedEvent = eventRepository.save(event);

        EventUser eventUser = new EventUser();
        eventUser.setEvent(savedEvent);
        eventUser.setUser(creator);
        eventUser.setAvailable(new ArrayList<>());
        eventUser.setNotAvailable(new ArrayList<>());

        eventUserRepository.save(eventUser);

        return EventResponseDto.from(savedEvent);
    }

    private String generateUniqueShortId() {
        String shortId;
        do {
            shortId = generateSlug();
        } while (eventRepository.existsByShortId(shortId));
        return shortId;
    }

    private String generateSlug() {
        List<String> words = WordConstants.ID_WORDS;

        String first = words.get(ThreadLocalRandom.current().nextInt(words.size()));
        String second = words.get(ThreadLocalRandom.current().nextInt(words.size()));
        String third = words.get(ThreadLocalRandom.current().nextInt(words.size()));
        int number = ThreadLocalRandom.current().nextInt(100000, 1000000);

        return first + "-" + second + "-" + third + "-" + number;
    }

    public EventResponseDto getEventByShortId(String shortId) {
        Event event = eventRepository.findByShortIdAndDeletedFalse(shortId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Event not found: " + shortId
                ));
    return EventResponseDto.from(event);
    }

}

