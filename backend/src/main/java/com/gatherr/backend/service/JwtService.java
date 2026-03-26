package com.gatherr.backend.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.Map;

@Service
public class JwtService {

    private final Key key;

    public JwtService(@Value("${jwt.secret}") String secret) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
    }

    public String generateToken(String userId, String email) {

        long now = System.currentTimeMillis();
        long expiry = now + 1000 * 60 * 60 * 24; // 24 hours

        return Jwts.builder()
                .setSubject(userId)
                .addClaims(Map.of(
                        "email", email
                ))
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(expiry))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }
}