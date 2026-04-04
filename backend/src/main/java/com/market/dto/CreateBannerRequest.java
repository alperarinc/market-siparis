package com.market.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateBannerRequest(
        @NotBlank(message = "Banner başlığı zorunludur")
        @Size(max = 200)
        String title,

        @NotBlank(message = "Görsel URL zorunludur")
        @Size(max = 500)
        String imageUrl,

        @Size(max = 500)
        String linkUrl,

        @NotNull(message = "Banner tipi zorunludur (HERO veya PROMO)")
        String type,

        Integer sortOrder
) {}
