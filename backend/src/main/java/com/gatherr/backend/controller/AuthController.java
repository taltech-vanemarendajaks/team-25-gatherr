package com.gatherr.backend.controller;

import com.gatherr.backend.dto.AuthResponseDto;
import com.gatherr.backend.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*") // TODO: remove after testing
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleAuth(@AuthenticationPrincipal Jwt jwt) {
        AuthResponseDto response = authService.googleLogin(jwt);
        return ResponseEntity.ok(response);
    }
}

// Frontend call style:
// POST /auth/google
// Authorization: Bearer <GOOGLE_ID_TOKEN>