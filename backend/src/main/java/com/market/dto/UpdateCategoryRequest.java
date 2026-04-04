package com.market.dto;

import jakarta.validation.constraints.Size;

public record UpdateCategoryRequest(
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

        Long parentId,

        Boolean active
) {}
