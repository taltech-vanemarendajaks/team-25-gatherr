package com.gatherr.backend.dto;

// TODO: Frontend should detect the user's timezone from their browser and send it alongside the id_token in the login request

public record AuthRequestDto(
        String idToken,
        String timezone  // TZ identifier, e.g. "America/New_York"
) {}