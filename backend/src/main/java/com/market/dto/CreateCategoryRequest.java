package com.market.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateCategoryRequest(
        @NotBlank(message = "Kategori adı zorunludur")
        @Size(max = 100)
        String name,

        @Size(max = 500)
        String description,

        @Size(max = 500)
        String imageUrl,

        @Size(max = 10)
        String icon,

        java.math.BigDecimal vatRate,

        Integer sortOrder,

        Long parentId
) {}
