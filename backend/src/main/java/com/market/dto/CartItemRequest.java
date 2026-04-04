package com.market.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record CartItemRequest(
        @NotNull(message = "Ürün ID zorunludur")
        Long productId,

        @NotNull(message = "Miktar zorunludur")
        @DecimalMin(value = "0.001", message = "Miktar en az 0.001 olmalıdır")
        BigDecimal quantity
) {}
