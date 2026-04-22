package com.gatherr.backend.dto;

import jakarta.validation.constraints.Pattern;

import java.util.List;

public record RespondDto(
        List<@Pattern(regexp = "^\\d{4}-\\d{8}$", message = "Slot timestamp must be in format HHmm-ddMMyyyy") String> available,
        List<@Pattern(regexp = "^\\d{4}-\\d{8}$", message = "Slot timestamp must be in format HHmm-ddMMyyyy") String> notAvailable,
        String timezone
) {}
