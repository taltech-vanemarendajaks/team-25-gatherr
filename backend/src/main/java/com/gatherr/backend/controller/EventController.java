package com.gatherr.backend.controller;

import com.gatherr.backend.dto.CreateEventDto;
import com.gatherr.backend.dto.EventResponseDto;
import com.gatherr.backend.service.EventService;
import com.gatherr.backend.util.JwtUtils;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import java.util.List;


@RestController
@RequestMapping("/events")
@RequiredArgsConstructor

public class EventController {
    private final EventService eventService;

    @PostMapping
    public ResponseEntity<EventResponseDto> createEvent(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody CreateEventDto createEventDto
    ) {
        Long creatorId = JwtUtils.extractUserId(jwt);
        EventResponseDto response = eventService.createEvent(creatorId, createEventDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/mine")
    public ResponseEntity<List<EventResponseDto>> getEvents(
            @AuthenticationPrincipal Jwt jwt
    ) {
        Long creatorId = JwtUtils.extractUserId(jwt);
        List<EventResponseDto> response = eventService.getMyEvents(creatorId);
        return ResponseEntity.ok(response);
    }
}
