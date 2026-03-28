package com.gatherr.backend.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import javax.crypto.SecretKey;

@Service
public class JwtService {

    private final SecretKey key;
    private final long expirationTime;

    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration:86400000}") long expirationTime // Defaults to 24h if not in properties
    ) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationTime = expirationTime;
    }

    public String generateToken(Long internalUserId, String email, String name, String picture) {
        long now = System.currentTimeMillis();
        long expiry = now + expirationTime;

        return Jwts.builder()
                .subject(String.valueOf(internalUserId))
                .claim("email", email)
                .claim("name", name)
                .claim("profilePicture", picture)
                .issuedAt(new Date(now))
                .expiration(new Date(expiry))
                .signWith(key) 
                .compact();
    }
}