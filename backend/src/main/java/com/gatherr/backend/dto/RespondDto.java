package com.gatherr.backend.dto;

import java.util.List;

public record RespondDto(
        List<String> available,
        List<String> notAvailable,
        String timezone
) {}
