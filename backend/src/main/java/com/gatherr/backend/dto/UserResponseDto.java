package com.gatherr.backend.dto;

public record UserResponseDto (
        Long id,
        String name,
        String email,
        String profilePicture,
        String timezone,
        Boolean startOnMonday,
        Boolean timeFormat24,
        String language
) {}
