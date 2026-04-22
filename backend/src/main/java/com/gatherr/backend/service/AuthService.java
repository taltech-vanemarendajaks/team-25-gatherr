package com.gatherr.backend.service;

import com.gatherr.backend.dto.AuthRequestDto;
import com.gatherr.backend.dto.AuthResponseDto;
import com.gatherr.backend.repository.UserRepository;
import com.gatherr.backend.model.User;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jwt.BadJwtException;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.web.client.RestClientException;
import java.util.Map;

@Service
public class AuthService {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final JwtDecoder googleJwtDecoder;
    private final RestTemplate restTemplate;

    private final boolean skipGoogleVerification;
    private final String devUserEmail;

    public AuthService(
            JwtService jwtService,
            UserRepository userRepository,
            JwtDecoder googleJwtDecoder,
            RestTemplate restTemplate,
            @Value("${app.auth.skip-google-verification:false}") boolean skipGoogleVerification,
            @Value("${app.auth.dev-user-email:#{null}}") String devUserEmail) {

        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.googleJwtDecoder = googleJwtDecoder;
        this.restTemplate = restTemplate;
        this.skipGoogleVerification = skipGoogleVerification;
        this.devUserEmail = devUserEmail;

        if (this.skipGoogleVerification && (this.devUserEmail == null || this.devUserEmail.isBlank())) {
            throw new IllegalStateException("FATAL: Google Auth bypass is enabled, but 'app.auth.dev-user-email' is missing in your properties/env.");
        }
    }

    @Transactional
    public AuthResponseDto googleLogin(AuthRequestDto request) {
        String timezone = (request.timezone() != null && !request.timezone().isBlank()) ? request.timezone() : "UTC";

        AuthResponseDto devResponse = checkIfDev(timezone);
        if (devResponse != null) {
            return devResponse;
        }

        if (request.accessToken() != null && !request.accessToken().isBlank()) {
            return loginWithAccessToken(request.accessToken(), timezone);
        } else {
            return loginWithIdToken(request.idToken(), timezone);
        }
    }

    private AuthResponseDto loginWithIdToken(String idToken, String timezone) {
        Jwt jwt = googleJwtDecoder.decode(idToken);

        Boolean emailVerified = jwt.getClaimAsBoolean("email_verified");
        if (emailVerified == null || !emailVerified) {
            throw new BadJwtException("Google account email is not verified.");
        }

        String email = jwt.getClaimAsString("email");
        String name = jwt.getClaimAsString("name");
        String picture = jwt.getClaimAsString("picture");

        String locale = jwt.getClaimAsString("locale");
        String language = (locale != null) ? locale.substring(0, 2).toUpperCase() : "EN";

        User user = getOrCreateUser(email, name, picture, language, timezone);
        String appToken = jwtService.generateToken(user.getId(), email);

        return new AuthResponseDto(appToken, user.getId(), user.getName(), user.getEmail(), user.getProfilePicture());
    }

    private AuthResponseDto loginWithAccessToken(String accessToken, String timezone) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<Map<String, Object>> response;
        try {
            response = restTemplate.exchange(
                    "https://www.googleapis.com/oauth2/v3/userinfo",
                    HttpMethod.GET,
                    entity,
                    new ParameterizedTypeReference<Map<String, Object>>() {}
            );
        } catch (RestClientException e) {
            throw new BadJwtException("Failed to verify Google access token: " + e.getMessage());
        }

        Map<String, Object> userInfo = response.getBody();
        if (userInfo == null) {
            throw new BadJwtException("Empty response from Google userinfo endpoint.");
        }

        Boolean emailVerified = (Boolean) userInfo.get("email_verified");
        if (emailVerified == null || !emailVerified) {
            throw new BadJwtException("Google account email is not verified.");
        }

        String email = (String) userInfo.get("email");
        String name = (String) userInfo.get("name");
        String picture = (String) userInfo.get("picture");
        String locale = (String) userInfo.get("locale");
        String language = (locale != null) ? locale.substring(0, 2).toUpperCase() : "EN";

        User user = getOrCreateUser(email, name, picture, language, timezone);
        String appToken = jwtService.generateToken(user.getId(), email);

        return new AuthResponseDto(appToken, user.getId(), user.getName(), user.getEmail(), user.getProfilePicture());
    }

    private AuthResponseDto checkIfDev(String timezone) {
        if (skipGoogleVerification) {
            User devUser = getOrCreateUser(devUserEmail, "Dev User", "", "EN", timezone);
            String devAppToken = jwtService.generateToken(devUser.getId(), devUserEmail);
            
            return new AuthResponseDto(
                    devAppToken,
                    devUser.getId(),
                    devUser.getName(),
                    devUser.getEmail(),
                    devUser.getProfilePicture()
            );
        }
        return null;
    }

    private User getOrCreateUser(String email, String name, String picture, String language, String timezone) {
        return userRepository.findByEmail(email)
                .orElseGet(() -> createNewUser(email, name, picture, language, timezone));
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