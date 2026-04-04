package com.market.domain;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "products")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Product extends BaseEntity {

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "slug", nullable = false, unique = true, length = 220)
    private String slug;

    @Column(name = "description", length = 1000)
    private String description;

    @Column(name = "barcode", length = 50)
    private String barcode;

    @Column(name = "sku", unique = true, length = 50)
    private String sku;

    @Column(name = "price", nullable = false, precision = 10, scale = 3)
    private BigDecimal price;

    @Column(name = "discounted_price", precision = 10, scale = 3)
    private BigDecimal discountedPrice;

    @Column(name = "price_includes_vat", nullable = false)
    @Builder.Default
    private Boolean priceIncludesVat = true;

    @Column(name = "unit", nullable = false, length = 20)
    @Builder.Default
    private String unit = "adet";

    @Column(name = "stock_quantity", nullable = false)
    @Builder.Default
    private Integer stockQuantity = 0;

    @Column(name = "min_stock_level")
    @Builder.Default
    private Integer minStockLevel = 5;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "image_urls", length = 2000)
    private String imageUrls;

    @Column(name = "brand", length = 100)
    private String brand;

    @Column(name = "origin", length = 100)
    private String origin;

    @Column(name = "weight_info", length = 100)
    private String weightInfo;

    @Column(name = "storage_conditions", length = 500)
    private String storageConditions;

    @Column(name = "ingredients", length = 2000)
    private String ingredients;

    @Column(name = "expiry_date")
    private java.time.LocalDate expiryDate;

    @Column(name = "active", nullable = false)
    @Builder.Default
    private Boolean active = true;

    @Column(name = "featured", nullable = false)
    @Builder.Default
    private Boolean featured = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    public BigDecimal getEffectivePrice() {
        return discountedPrice != null ? discountedPrice : price;
    }

    public boolean isInStock() {
        return stockQuantity > 0;
    }
}
