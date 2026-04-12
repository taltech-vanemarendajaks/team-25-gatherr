package com.gatherr.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.gatherr.backend.dto.UserResponseDto;
import com.gatherr.backend.service.UserService;
import com.gatherr.backend.util.SecurityUtils;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserResponseDto> getCurrentUser() {
        Long userId = SecurityUtils.getCurrentUser(); 
        UserResponseDto response = userService.getCurrentUser(userId);
        return ResponseEntity.ok(response);
    }
}
