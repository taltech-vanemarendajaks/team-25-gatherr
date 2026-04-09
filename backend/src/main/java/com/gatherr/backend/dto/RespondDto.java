package com.gatherr.backend.dto;

import java.util.List;

public record RespondDto<T>(
        List<String> available,
        List<String> notAvailable,
        String timezone
) {}
