package com.gatherr.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import com.gatherr.backend.dto.UserResponseDto;
import com.gatherr.backend.model.User;
import com.gatherr.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserResponseDto getCurrentUser(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + userId));

        return new UserResponseDto(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getProfilePicture(),
                user.getTimezone(),
                user.isStartOnMonday(),
                user.isTimeFormat24(),
                user.getLanguage()
        );
    }
}
