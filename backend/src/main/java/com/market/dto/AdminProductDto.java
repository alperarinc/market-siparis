package com.market.dto;

import com.market.domain.Product;

import java.math.BigDecimal;
import java.time.LocalDate;

public record AdminProductDto(
        Long id,
        String name,
        String slug,
        BigDecimal price,
        BigDecimal discountedPrice,
        String unit,
        Integer stockQuantity,
        Integer minStockLevel,
        boolean active,
        boolean featured,
        String categoryName,
        Long categoryId,
        LocalDate expiryDate,
        boolean expiringSoon,
        boolean expired
) {
    public static AdminProductDto from(Product product) {
        LocalDate expiry = product.getExpiryDate();
        LocalDate today = LocalDate.now();
        boolean expired = expiry != null && expiry.isBefore(today);
        boolean expiringSoon = expiry != null && !expired && expiry.isBefore(today.plusDays(7));

        return new AdminProductDto(
                product.getId(),
                product.getName(),
                product.getSlug(),
                product.getPrice(),
                product.getDiscountedPrice(),
                product.getUnit(),
                product.getStockQuantity(),
                product.getMinStockLevel(),
                product.getActive(),
                product.getFeatured(),
                product.getCategory().getName(),
                product.getCategory().getId(),
                expiry,
                expiringSoon,
                expired
        );
    }
}
