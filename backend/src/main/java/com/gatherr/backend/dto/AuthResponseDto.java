package com.gatherr.backend.dto;

public record AuthResponseDto (
            String token,
            Long id,
            String name,
            String email,
            String profilePicture
) {}
