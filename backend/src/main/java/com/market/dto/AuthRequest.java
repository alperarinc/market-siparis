package com.market.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record AuthRequest(
        @NotBlank(message = "Telefon numarası zorunludur")
        @Pattern(regexp = "^05\\d{9}$", message = "Geçerli bir telefon numarası giriniz (05XXXXXXXXX)")
        String phone
) {}
