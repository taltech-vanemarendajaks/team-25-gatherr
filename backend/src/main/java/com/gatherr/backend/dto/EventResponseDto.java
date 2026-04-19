package com.gatherr.backend.dto;

import com.gatherr.backend.model.Event;
import com.gatherr.backend.model.enums.EventType;

public record EventResponseDto(
        Long id,
        String name,
        String description,
        String shortId,
        Long creatorId,
        EventType type,
        String timezone,
        int respondedCount
) {
    public static EventResponseDto from(Event event) {
        int respondedCount = event.getEventUsers() == null ? 0 : (int) event.getEventUsers().stream()
                .filter(eu -> !eu.getAvailable().isEmpty() || !eu.getNotAvailable().isEmpty())
                .count();

        return new EventResponseDto(
                event.getId(),
                event.getName(),
                event.getDescription(),
                event.getShortId(),
                event.getCreator() != null ? event.getCreator().getId() : null,
                event.getType(),
                event.getTimezone(),
                respondedCount
        );
    }
}