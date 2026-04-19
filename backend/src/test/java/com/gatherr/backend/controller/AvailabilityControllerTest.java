package com.gatherr.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gatherr.backend.dto.RespondDto;
import com.gatherr.backend.service.AvailabilityService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
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
}
