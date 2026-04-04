package com.market.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record CreateProductRequest(
        @NotBlank(message = "Ürün adı zorunludur")
        String name,

        String description,
        String barcode,

        @NotNull(message = "Fiyat zorunludur")
        BigDecimal price,

        BigDecimal discountedPrice,
        Boolean priceIncludesVat,
        String unit,
        Integer stockQuantity,
        Integer minStockLevel,
        String imageUrl,
        Boolean featured,

        @NotNull(message = "Kategori zorunludur")
        Long categoryId,

        String brand,
        String origin,
        String weightInfo,
        String storageConditions,
        String ingredients,
        String expiryDate
) {}
