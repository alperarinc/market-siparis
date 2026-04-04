package com.market.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record OtpVerifyRequest(
        @NotBlank(message = "Telefon numarası zorunludur")
        String phone,

        @NotBlank(message = "Doğrulama kodu zorunludur")
        @Pattern(regexp = "^\\d{6}$", message = "Doğrulama kodu 6 haneli olmalıdır")
        String otp
) {}
