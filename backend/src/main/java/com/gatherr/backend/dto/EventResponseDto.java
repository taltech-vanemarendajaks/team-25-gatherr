package com.gatherr.backend.dto;

import com.gatherr.backend.model.Event;
import com.gatherr.backend.model.enums.EventType;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.List;

@Getter
@Setter
public class EventResponseDto {
    private Long id;
    private String name;
    private String description;
    private String shortId;
    private Long creatorId;
    private EventType type;
    private List<String> times;
    private String timezone;
    private boolean isDeleted;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public static EventResponseDto from(Event event) {
        EventResponseDto eventResponseDto = new EventResponseDto();
        eventResponseDto.setId(event.getId());
        eventResponseDto.setName(event.getName());
        eventResponseDto.setDescription(event.getDescription());
        eventResponseDto.setShortId(event.getShortId());
        eventResponseDto.setCreatorId(event.getCreator() != null ? event.getCreator().getId() : null);
        eventResponseDto.setType(event.getType());
        eventResponseDto.setTimes(event.getTimes());
        eventResponseDto.setTimezone(event.getTimezone());
        eventResponseDto.setDeleted(event.isDeleted());
        eventResponseDto.setCreatedAt(event.getCreatedAt());
        eventResponseDto.setUpdatedAt(event.getUpdatedAt());
        return eventResponseDto;
    }
}