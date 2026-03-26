package com.gatherr.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.*;

public class JwtConfig {

    @Bean
    public JwtDecoder jwtDecoder() {
        NimbusJwtDecoder decoder =
                JwtDecoders.fromIssuerLocation("https://accounts.google.com");

        OAuth2TokenValidator<Jwt> audienceValidator = jwt -> {
            if (jwt.getAudience().contains("YOUR_GOOGLE_CLIENT_ID")) {
                return OAuth2TokenValidatorResult.success();
            }
            return OAuth2TokenValidatorResult.failure(
                    new OAuth2Error("invalid_token", "Invalid audience", null)
            );
        };

        OAuth2TokenValidator<Jwt> withIssuer =
                JwtValidators.createDefaultWithIssuer("https://accounts.google.com");

        decoder.setJwtValidator(
                new DelegatingOAuth2TokenValidator<>(withIssuer, audienceValidator)
        );

        return decoder;
    }
}