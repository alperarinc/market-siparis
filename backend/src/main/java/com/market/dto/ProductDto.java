package com.market.dto;

import com.market.domain.Product;

import java.math.BigDecimal;
import java.math.RoundingMode;

public record ProductDto(
        Long id,
        String name,
        String slug,
        String description,
        String barcode,
        BigDecimal price,
        BigDecimal discountedPrice,
        BigDecimal effectivePrice,
        BigDecimal vatRate,
        boolean priceIncludesVat,
        BigDecimal priceWithVat,
        BigDecimal priceWithoutVat,
        BigDecimal vatAmount,
        String unit,
        Integer stockQuantity,
        boolean inStock,
        String imageUrl,
        java.util.List<String> imageUrls,
        String brand,
        String origin,
        String weightInfo,
        String storageConditions,
        String ingredients,
        boolean featured,
        Long categoryId,
        String categoryName
) {
    public static ProductDto from(Product product) {
        BigDecimal vatRate = product.getCategory().getVatRate() != null
                ? product.getCategory().getVatRate()
                : BigDecimal.TEN;

        BigDecimal effectivePrice = product.getEffectivePrice();
        boolean includesVat = product.getPriceIncludesVat();

        BigDecimal priceWithVat;
        BigDecimal priceWithoutVat;
        BigDecimal vatAmount;

        BigDecimal vatMultiplier = BigDecimal.ONE.add(vatRate.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP));

        if (includesVat) {
            priceWithVat = effectivePrice;
            priceWithoutVat = effectivePrice.divide(vatMultiplier, 3, RoundingMode.HALF_UP);
            vatAmount = priceWithVat.subtract(priceWithoutVat);
        } else {
            priceWithoutVat = effectivePrice;
            vatAmount = effectivePrice.multiply(vatRate).divide(BigDecimal.valueOf(100), 3, RoundingMode.HALF_UP);
            priceWithVat = effectivePrice.add(vatAmount);
        }

        return new ProductDto(
                product.getId(),
                product.getName(),
                product.getSlug(),
                product.getDescription(),
                product.getBarcode(),
                product.getPrice(),
                product.getDiscountedPrice(),
                effectivePrice,
                vatRate,
                includesVat,
                priceWithVat,
                priceWithoutVat,
                vatAmount,
                product.getUnit(),
                product.getStockQuantity(),
                product.isInStock(),
                product.getImageUrl(),
                product.getImageUrls() != null
                        ? java.util.Arrays.asList(product.getImageUrls().split(","))
                        : java.util.List.of(),
                product.getBrand(),
                product.getOrigin(),
                product.getWeightInfo(),
                product.getStorageConditions(),
                product.getIngredients(),
                product.getFeatured(),
                product.getCategory().getId(),
                product.getCategory().getName()
        );
    }
}
