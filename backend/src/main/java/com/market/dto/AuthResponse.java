package com.market.dto;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        UserDto user
) {}
