package com.gatherr.backend.controller;

import com.gatherr.backend.dto.UserResponseDto;
import com.gatherr.backend.dto.UpdateUserDto;
import com.gatherr.backend.service.UserService;
import com.gatherr.backend.util.JwtUtils;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor

public class UserController {
    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserResponseDto> getCurrentUser(
        @AuthenticationPrincipal Jwt jwt
    ) {
        Long userId = JwtUtils.extractUserId(jwt);
        UserResponseDto response = userService.getCurrentUser(userId);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/me")
    public ResponseEntity<UserResponseDto> patchCurrentUser(
        @AuthenticationPrincipal Jwt jwt, 
        @Valid @RequestBody UpdateUserDto dto
    ) {
        Long userId = JwtUtils.extractUserId(jwt);
        UserResponseDto response = userService.patchCurrentUser(userId, dto);
        return ResponseEntity.ok(response);
    }
}
