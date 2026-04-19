package com.gatherr.backend.repository;

import com.gatherr.backend.model.UserGoogleToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserGoogleTokenRepository extends JpaRepository<UserGoogleToken, Long> {
    Optional<UserGoogleToken> findByUserId(Long userId);
    void deleteByUserId(Long userId);
}