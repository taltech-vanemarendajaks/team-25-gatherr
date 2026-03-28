package com.gatherr.backend.security;

import com.gatherr.backend.service.AuthService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final AuthService authService;
    private final String frontendUrl;

    public OAuth2LoginSuccessHandler(
            AuthService authService,
            @Value("${app.frontend.url:http://localhost:3000}") String frontendUrl) {
        this.authService = authService;
        this.frontendUrl = frontendUrl;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String token = authService.processOAuthPostLogin(oAuth2User);

        Cookie authCookie = new Cookie("gatherr_token", token);
        authCookie.setHttpOnly(true);
        authCookie.setSecure(false);  // TODO: Set to TRUE in production (requires HTTPS)
        authCookie.setPath("/");
        authCookie.setMaxAge(24 * 60 * 60);

        response.addCookie(authCookie);
        getRedirectStrategy().sendRedirect(request, response, frontendUrl + "/dashboard");
    }
}