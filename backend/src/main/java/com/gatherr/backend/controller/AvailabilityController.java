package com.gatherr.backend.controller;

import com.gatherr.backend.dto.EventSummaryDto;
import com.gatherr.backend.dto.RespondDto;
import com.gatherr.backend.service.AvailabilityService;
import com.gatherr.backend.util.JwtUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/events")
@RequiredArgsConstructor
public class AvailabilityController {

    private final AvailabilityService availabilityService;

    @PutMapping("/{shortId}/respond")
    public ResponseEntity<Void> respond(
            @PathVariable String shortId,
            @Valid @RequestBody RespondDto dto,
            @AuthenticationPrincipal Jwt jwt) {
        Long userId = JwtUtils.extractUserId(jwt);
        availabilityService.respond(userId, shortId, dto);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{shortId}/summary")
    public ResponseEntity<EventSummaryDto> summary(@PathVariable String shortId) {
        return ResponseEntity.ok(availabilityService.getSummary(shortId));
    }
}
