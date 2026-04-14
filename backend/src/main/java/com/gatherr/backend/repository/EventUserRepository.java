package com.gatherr.backend.repository;

import com.gatherr.backend.model.EventUser;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EventUserRepository extends JpaRepository<EventUser, Long> {
    List<EventUser> findByUserIdAndEvent_IsDeletedFalse(Long userId);
}
