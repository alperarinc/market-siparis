package com.market.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "Telefon numarası zorunludur")
        String phone,

        @NotBlank(message = "Doğrulama kodu zorunludur")
        String otp,

        @NotBlank(message = "Ad soyad zorunludur")
        @Size(min = 3, max = 100, message = "Ad soyad en az 3, en fazla 100 karakter olmalıdır")
        String fullName,

        @NotBlank(message = "Adres zorunludur")
        @Size(min = 10, max = 500, message = "Adres en az 10 karakter olmalıdır")
        String fullAddress,

        @NotBlank(message = "Mahalle zorunludur")
        String district
) {}
