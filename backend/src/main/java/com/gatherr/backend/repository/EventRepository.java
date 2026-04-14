package com.gatherr.backend.repository;

import com.gatherr.backend.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventRepository extends JpaRepository<Event, Long> {
    boolean existsByShortId(String shortId);
}