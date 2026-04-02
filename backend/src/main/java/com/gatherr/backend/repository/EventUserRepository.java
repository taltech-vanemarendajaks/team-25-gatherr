package com.gatherr.backend.repository;

import com.gatherr.backend.model.EventUser;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventUserRepository extends JpaRepository<EventUser, Long> {
}
