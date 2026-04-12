package com.gatherr.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.gatherr.backend.dto.UpdateUserDto;
import com.gatherr.backend.dto.UserResponseDto;
import com.gatherr.backend.model.User;
import com.gatherr.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public UserResponseDto getCurrentUser(Long userId) {
        User user = getUserById(userId);
        return getUserResponseDto(user);
    }

    @Transactional
    public UserResponseDto patchCurrentUser(Long userId, UpdateUserDto dto) {
        User user = getUserById(userId);

        if (dto.timezone() != null) {
            user.setTimezone(dto.timezone());
        }
        if (dto.startOnMonday() != null) {
            user.setStartOnMonday(dto.startOnMonday());
        }
        if (dto.timeFormat24() != null) {
            user.setTimeFormat24(dto.timeFormat24());
        }
        if (dto.language() != null) {
            user.setLanguage(dto.language());
        }
        userRepository.save(user);
        return getUserResponseDto(user);
    }

    private User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + userId));
    }

    private UserResponseDto getUserResponseDto(User user) {
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
