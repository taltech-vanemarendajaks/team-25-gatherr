package com.gatherr.backend.dto;

import java.util.List;

public record EventUserDto(
        UserInfo user,
        List<String> available,
        List<String> notAvailable
) {
    public record UserInfo(
            Long id,
            String name,
            String profilePicture
    ) {}
}
