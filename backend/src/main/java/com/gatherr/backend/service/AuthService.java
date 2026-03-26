package com.gatherr.backend.service;

import com.gatherr.backend.dto.AuthResponseDto;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class AuthService {

    private final JwtService jwtService;

    public AuthService(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    public AuthResponseDto googleLogin(Jwt jwt) {

        String googleId = jwt.getSubject();
        String email = jwt.getClaim("email");
        String name = jwt.getClaim("name");
        String picture = jwt.getClaim("picture");

        // TODO: find user in database, userID 1L as placeholder for now
        Long userId = 1L;

        String appToken = jwtService.generateToken(googleId, email);

        return new AuthResponseDto(
                appToken,
                userId,
                name,
                email,
                picture
        );
    }
}