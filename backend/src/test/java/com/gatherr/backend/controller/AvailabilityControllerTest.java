package com.gatherr.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gatherr.backend.dto.EventSummaryDto;
import com.gatherr.backend.dto.EventUserDto;
import com.gatherr.backend.dto.RespondDto;
import com.gatherr.backend.dto.SlotSummaryDto;
import com.gatherr.backend.dto.SlotUserDto;
import com.gatherr.backend.service.AvailabilityService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AvailabilityControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AvailabilityService availabilityService;

    private static final String PATH = "/events/some-event-123/respond";

    private String validBody() throws Exception {
        return objectMapper.writeValueAsString(new RespondDto(
                List.of("2025-06-01T09:00"),
                List.of("2025-06-01T10:00"),
                "Europe/Tallinn"
        ));
    }

    @Test
    void returns401_whenNoAuthorizationHeader() throws Exception {
        mockMvc.perform(put(PATH)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validBody()))
                .andExpect(status().isUnauthorized());

        verifyNoInteractions(availabilityService);
    }

    @Test
    void returns401_whenBearerTokenIsInvalid() throws Exception {
        mockMvc.perform(put(PATH)
                        .header("Authorization", "Bearer not-a-real-jwt")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validBody()))
                .andExpect(status().isUnauthorized());

        verifyNoInteractions(availabilityService);
    }

    @Test
    void returns200_whenAuthenticatedAndPayloadValid() throws Exception {
        mockMvc.perform(put(PATH)
                        .with(jwt().jwt(builder -> builder.subject("42")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validBody()))
                .andExpect(status().isOk());
    }

    @Test
    void returns400_whenJwtSubjectIsNotNumeric() throws Exception {
        mockMvc.perform(put(PATH)
                        .with(jwt().jwt(builder -> builder.subject("not-a-number")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validBody()))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(availabilityService);
    }

    @Test
    void summary_isPublic_returns200WithoutJwt() throws Exception {
        EventSummaryDto response = new EventSummaryDto(
                List.of(new EventUserDto(
                        new EventUserDto.UserInfo(1L, "Alice Müller", "https://example.com/alice.png"),
                        List.of("1030-08042026"),
                        List.of("1830-13042026")
                )),
                List.of(new SlotSummaryDto(
                        "1030-08042026",
                        1,
                        List.of(new SlotUserDto(1L, "Alice Müller"))
                ))
        );
        when(availabilityService.getSummary("some-event-123")).thenReturn(response);

        mockMvc.perform(get("/events/some-event-123/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.users[0].user.id").value(1))
                .andExpect(jsonPath("$.users[0].user.name").value("Alice Müller"))
                .andExpect(jsonPath("$.users[0].available[0]").value("1030-08042026"))
                .andExpect(jsonPath("$.slots[0].slot").value("1030-08042026"))
                .andExpect(jsonPath("$.slots[0].count").value(1))
                .andExpect(jsonPath("$.slots[0].users[0].id").value(1))
                .andExpect(jsonPath("$.slots[0].users[0].name").value("Alice Müller"));
    }

    @Test
    void summary_returns404_whenServiceThrowsNotFound() throws Exception {
        when(availabilityService.getSummary("missing"))
                .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));

        mockMvc.perform(get("/events/missing/summary"))
                .andExpect(status().isNotFound());
    }
}
