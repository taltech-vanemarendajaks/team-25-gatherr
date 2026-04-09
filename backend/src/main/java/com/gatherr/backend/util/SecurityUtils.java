package com.gatherr.backend.util;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;

public class SecurityUtils {

    private SecurityUtils() {}

    public static Long getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication != null && authentication.getPrincipal() instanceof Jwt jwt) {
            return Long.valueOf(jwt.getSubject());
        }
        
        throw new IllegalStateException("User is not authenticated");
    }
}