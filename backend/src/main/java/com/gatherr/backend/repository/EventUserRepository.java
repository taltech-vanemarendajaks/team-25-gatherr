package com.gatherr.backend.repository;

import com.gatherr.backend.model.EventUser;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

import java.util.Optional;

public interface EventUserRepository extends JpaRepository<EventUser, Long> {
    List<EventUser> findByUserIdAndEvent_IsDeletedFalse(Long userId);
    Optional<EventUser> findByEventShortIdAndUserId(String shortId, Long userId);
}
