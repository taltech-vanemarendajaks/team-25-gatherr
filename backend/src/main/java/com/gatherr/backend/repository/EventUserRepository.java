package com.gatherr.backend.repository;

import com.gatherr.backend.model.EventUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EventUserRepository extends JpaRepository<EventUser, Long> {
    Optional<EventUser> findByEventShortIdAndUserId(String shortId, Long userId);

    List<EventUser> findByEventShortId(String shortId);
}
