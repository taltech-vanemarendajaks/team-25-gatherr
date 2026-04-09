package com.gatherr.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.gatherr.backend.dto.UserResponseDto;
import com.gatherr.backend.model.User;
import com.gatherr.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserResponseDto getCurrentUser(Long userId) {

        User creator = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + userId));

        return new UserResponseDto(
                creator.getId(),
                creator.getName(),
                creator.getEmail(),
                creator.getProfilePicture(),
                creator.getTimezone(),
                creator.isStartOnMonday(),
                creator.isTimeFormat24(),
                creator.getLanguage()
        );
    }
}
