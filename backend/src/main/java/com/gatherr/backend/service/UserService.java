package com.gatherr.backend.service;

import com.gatherr.backend.dto.UpdateUserDto;
import com.gatherr.backend.dto.UserResponseDto;
import com.gatherr.backend.mapper.UserMapper;
import com.gatherr.backend.model.User;
import com.gatherr.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;

    public UserResponseDto getCurrentUser(Long userId) {
        User user = getUserById(userId);
        return userMapper.toResponseDto(user);
    }

    @Transactional
    public UserResponseDto patchCurrentUser(Long userId, UpdateUserDto dto) {
        User user = getUserById(userId);
        userMapper.updateUserFromDto(dto, user);
        userRepository.save(user);
        return userMapper.toResponseDto(user);
    }

    private User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + userId));
    }
}
