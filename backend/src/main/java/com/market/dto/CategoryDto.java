package com.market.dto;

import com.market.domain.Category;

import java.util.List;

public record CategoryDto(
        Long id,
        String name,
        String slug,
        String description,
        String imageUrl,
        String icon,
        java.math.BigDecimal vatRate,
        Integer sortOrder,
        Boolean active,
        Long parentId,
        List<CategoryDto> children
) {
    public static CategoryDto from(Category category) {
        return new CategoryDto(
                category.getId(),
                category.getName(),
                category.getSlug(),
                category.getDescription(),
                category.getImageUrl(),
                category.getIcon(),
                category.getVatRate(),
                category.getSortOrder(),
                category.getActive(),
                category.getParent() != null ? category.getParent().getId() : null,
                category.getChildren().stream()
                        .filter(Category::getActive)
                        .map(CategoryDto::from)
                        .toList()
        );
    }
}
