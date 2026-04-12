package com.gatherr.backend.repository;

import com.gatherr.backend.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {
    boolean existsByShortId(String shortId);
    List<Event> findByCreatorIdAndIsDeletedFalse(Long creatorId);
}
