package com.gatherr.backend.dto;

import java.util.List;

public record EventSummaryDto(
        List<EventUserDto> users,
        List<SlotSummaryDto> slots
) {}
