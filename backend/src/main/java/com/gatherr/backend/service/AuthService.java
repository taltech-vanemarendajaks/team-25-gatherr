package com.gatherr.backend.service;

import com.gatherr.backend.dto.AuthRequestDto;
import com.gatherr.backend.dto.AuthResponseDto;
import com.gatherr.backend.repository.UserRepository;
import com.gatherr.backend.model.User;

import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final JwtDecoder googleJwtDecoder;

    public AuthService(JwtService jwtService, UserRepository userRepository, JwtDecoder googleJwtDecoder) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.googleJwtDecoder = googleJwtDecoder;

    }

    @Transactional
    public AuthResponseDto googleLogin(AuthRequestDto request) {

        Jwt jwt = googleJwtDecoder.decode(request.idToken());

        String googleId = jwt.getSubject();
        String email = jwt.getClaimAsString("email");
        String name = jwt.getClaimAsString("name");
        String picture = jwt.getClaimAsString("picture");

        String locale = jwt.getClaimAsString("locale");
        String language = (locale != null) ? locale.substring(0, 2).toUpperCase() : "EN";
        String timezone = (request.timezone() != null && !request.timezone().isBlank()) ? request.timezone() : "UTC";

        User user = userRepository.findByEmail(email)
                .orElseGet(() -> createNewUser(email, name, picture, language, timezone));

        String appToken = jwtService.generateToken(googleId, email);

        return new AuthResponseDto(
                appToken,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getProfilePicture()
        );
    }

    private User createNewUser(String email, String name, String picture, String language, String timezone) {
        User newUser = User.builder()
                .name(name)
                .email(email)
                .profilePicture(picture)
                .timezone(timezone)
                .language(language)
                .startOnMonday(true)
                .timeFormat24(true)
                .build();
                
        return userRepository.save(newUser);
    }
}