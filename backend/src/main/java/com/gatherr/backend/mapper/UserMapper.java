package com.gatherr.backend.mapper;

import com.gatherr.backend.dto.UpdateUserDto;
import com.gatherr.backend.dto.UserResponseDto;
import com.gatherr.backend.model.User;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserResponseDto toResponseDto(User user);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateUserFromDto(UpdateUserDto dto, @MappingTarget User user);
}