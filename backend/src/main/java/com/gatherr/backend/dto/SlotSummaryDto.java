package com.gatherr.backend.dto;

import java.util.List;

public record SlotSummaryDto(
        String slot,
        int count,
        List<SlotUserDto> users
) {}
