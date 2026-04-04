package com.market.dto;

import com.market.domain.User;

import java.time.LocalDateTime;

public record UserDto(
        Long id,
        String phone,
        String fullName,
        String email,
        String role,
        Boolean active,
        LocalDateTime createdAt
) {
    public static UserDto from(User user) {
        return new UserDto(
                user.getId(),
                user.getPhone(),
                user.getFullName(),
                user.getEmail(),
                user.getRole().name(),
                user.getActive(),
                user.getCreatedAt()
        );
    }
}
