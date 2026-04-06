package com.gatherr.backend.dto;

import com.gatherr.backend.model.Event;
import com.gatherr.backend.model.enums.EventType;

import java.util.List;

public record EventResponseDto(
        Long id,
        String name,
        String description,
        String shortId,
        Long creatorId,
        EventType type,
        List<String> times,
        String timezone
) {
    public static EventResponseDto from(Event event) {
        return new EventResponseDto(
                event.getId(),
                event.getName(),
                event.getDescription(),
                event.getShortId(),
                event.getCreator() != null ? event.getCreator().getId() : null,
                event.getType(),
                event.getTimes(),
                event.getTimezone()
        );
    }
}