package com.gatherr.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gatherr.backend.model.EventUser;

public interface EventUserRepository extends JpaRepository<EventUser, Long> {
    List<EventUser> findByUserIdAndEvent_IsDeletedFalse(Long userId);

    Optional<EventUser> findByEventShortIdAndUserId(String shortId, Long userId);

    List<EventUser> findByEventShortId(String shortId);
}
