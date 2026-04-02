package com.gatherr.backend.controller;

import com.gatherr.backend.dto.CreateEventDto;
import com.gatherr.backend.dto.EventResponseDto;
import com.gatherr.backend.service.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/events")
@RequiredArgsConstructor

public class EventController {
    private final EventService eventService;

    @PostMapping
    public ResponseEntity<EventResponseDto> createEvent(
            @RequestHeader Long creatorId,
            @Valid @RequestBody CreateEventDto createEventDto
    ) {

        EventResponseDto response = eventService.createEvent(creatorId, createEventDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}