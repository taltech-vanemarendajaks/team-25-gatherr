package com.gatherr.backend.dto;

import org.springframework.lang.Nullable;
import jakarta.validation.constraints.Size;

public record UpdateUserDto (
        @Nullable @Size(max = 100, message = "Timezone string is too long") String timezone,
        @Nullable Boolean startOnMonday,
        @Nullable Boolean timeFormat24,
        @Nullable @Size(max = 10, message = "Language code is too long") String language
) {}