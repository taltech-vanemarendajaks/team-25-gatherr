package com.gatherr.backend.dto;

import org.springframework.lang.Nullable;

public record UpdateUserDto (
        @Nullable String timezone,
        @Nullable Boolean startOnMonday,
        @Nullable Boolean timeFormat24,
        @Nullable String language
) {}