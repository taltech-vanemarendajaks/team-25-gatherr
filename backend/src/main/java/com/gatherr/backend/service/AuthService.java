package com.gatherr.backend.service;

import com.gatherr.backend.repository.UserRepository;
import com.gatherr.backend.model.User;

import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public AuthService(JwtService jwtService, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Transactional
    public String processOAuthPostLogin(OAuth2User oAuth2User) {
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String picture = oAuth2User.getAttribute("picture");
        String locale = oAuth2User.getAttribute("locale");
        
        String language = (locale != null && locale.length() >= 2) 
                ? locale.substring(0, 2).toUpperCase() : "EN";

        User user = userRepository.findByEmail(email)
                .orElseGet(() -> createNewUser(email, name, picture, language, "UTC"));

        return jwtService.generateToken(user.getId(), email, name, picture);
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