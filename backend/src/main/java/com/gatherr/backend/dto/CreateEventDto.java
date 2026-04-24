package com.gatherr.backend.dto;

import com.gatherr.backend.model.enums.EventType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Setter
@Getter
public class CreateEventDto {
    @NotBlank
    private String name;

    private String description;

    @NotNull
    private EventType type;

    @NotEmpty
    private List<String> times;

    @NotBlank
    private String timezone;

    @NotNull
    private Integer timeIncrement;
}
