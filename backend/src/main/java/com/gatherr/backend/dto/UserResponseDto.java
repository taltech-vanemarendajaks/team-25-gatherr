package com.gatherr.backend.dto;

public record UserResponseDto (
        Long id,
        String name,
        String email,
        String profilePicture,
        String timezone,
        boolean startOnMonday,
        boolean timeFormat24,
        String language
) {}
