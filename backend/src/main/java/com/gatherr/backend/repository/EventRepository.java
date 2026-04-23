package com.gatherr.backend.repository;

import com.gatherr.backend.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EventRepository extends JpaRepository<Event, Long> {
    boolean existsByShortId(String shortId);
    Optional<Event> findByShortIdAndIsDeletedFalse(String shortId);
    Optional<Event> findByShortId(String shortId);
}
