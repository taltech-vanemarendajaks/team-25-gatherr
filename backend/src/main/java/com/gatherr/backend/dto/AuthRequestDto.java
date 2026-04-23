package com.gatherr.backend.dto;

// TODO: Frontend should detect the user's timezone from their browser and send it alongside the token in the login request

public record AuthRequestDto(
        String idToken,
        String accessToken,
        String timezone
) {}
