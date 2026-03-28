package com.gatherr.backend.controller;

import com.gatherr.backend.dto.AuthRequestDto;
import com.gatherr.backend.dto.AuthResponseDto;
import com.gatherr.backend.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.jsonwebtoken.JwtException;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/google")
    public ResponseEntity<AuthResponseDto> googleAuth(@RequestBody AuthRequestDto request) {
        try {
            AuthResponseDto response = authService.googleLogin(request);
            return ResponseEntity.ok(response);
        } catch (JwtException e) {
            return ResponseEntity.status(401).build();
        }
    }
}
