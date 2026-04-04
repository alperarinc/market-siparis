package com.market.dto;

import com.market.domain.Order;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderDto(
        Long id,
        String orderNumber,
        String status,
        BigDecimal subtotal,
        BigDecimal deliveryFee,
        BigDecimal discountAmount,
        BigDecimal totalVat,
        BigDecimal totalAmount,
        String paymentMethod,
        String paymentStatus,
        String note,
        String userName,
        String userPhone,
        String deliveryAddress,
        LocalDateTime estimatedDeliveryTime,
        LocalDateTime deliveredAt,
        LocalDateTime createdAt,
        List<OrderItemDto> items
) {
    public static OrderDto from(Order order) {
        String address = null;
        if (order.getDeliveryAddress() != null) {
            var a = order.getDeliveryAddress();
            address = (a.getDistrict() != null ? a.getDistrict() + ", " : "") + a.getFullAddress();
        }

        return new OrderDto(
                order.getId(),
                order.getOrderNumber(),
                order.getStatus().name(),
                order.getSubtotal(),
                order.getDeliveryFee(),
                order.getDiscountAmount(),
                order.getTotalVat(),
                order.getTotalAmount(),
                order.getPaymentMethod() != null ? order.getPaymentMethod().name() : null,
                order.getPaymentStatus().name(),
                order.getNote(),
                order.getUser().getFullName(),
                order.getUser().getPhone(),
                address,
                order.getEstimatedDeliveryTime(),
                order.getDeliveredAt(),
                order.getCreatedAt(),
                order.getItems().stream().map(OrderItemDto::from).toList()
        );
    }
}
