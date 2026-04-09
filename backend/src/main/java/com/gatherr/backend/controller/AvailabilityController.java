package com.gatherr.backend.controller;

import com.gatherr.backend.dto.RespondDto;
import com.gatherr.backend.service.AvailabilityService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
public class AvailabilityController {

    private final AvailabilityService availabilityService;

    public AvailabilityController(AvailabilityService availabilityService) {
        this.availabilityService = availabilityService;
    }

    @PutMapping("/events/{shortId}/respond")
    public ResponseEntity<Void> respond(
            @PathVariable String shortId,
            @Valid @RequestBody RespondDto<?> dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = Long.valueOf(userDetails.getUsername());
        availabilityService.respond(userId, shortId, dto);
        return ResponseEntity.ok().build();
    }
}
