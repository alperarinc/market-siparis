package com.market.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record CreateOrderRequest(
        @NotNull(message = "Teslimat adresi zorunludur")
        Long addressId,

        @NotNull(message = "Ödeme yöntemi zorunludur")
        @Pattern(regexp = "^(CREDIT_CARD|CASH_ON_DELIVERY)$", message = "Geçersiz ödeme yöntemi")
        String paymentMethod,

        Long deliverySlotId,

        String note
) {}
