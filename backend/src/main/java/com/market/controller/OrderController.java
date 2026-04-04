package com.market.controller;

import com.market.dto.ApiResponse;
import com.market.dto.CreateOrderRequest;
import com.market.dto.OrderDto;
import com.market.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
@Tag(name = "Siparişler", description = "Sipariş oluşturma ve takip")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @Operation(summary = "Yeni sipariş oluştur")
    public ResponseEntity<ApiResponse<OrderDto>> createOrder(
            Authentication auth,
            @Valid @RequestBody CreateOrderRequest request) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(ApiResponse.success("Sipariş oluşturuldu", orderService.createOrder(userId, request)));
    }

    @GetMapping
    @Operation(summary = "Siparişlerimi listele")
    public ResponseEntity<ApiResponse<Page<OrderDto>>> getMyOrders(
            Authentication auth,
            @PageableDefault(size = 10) Pageable pageable) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(ApiResponse.success(orderService.getUserOrders(userId, pageable)));
    }

    @GetMapping("/{orderNumber}")
    @Operation(summary = "Sipariş detayı")
    public ResponseEntity<ApiResponse<OrderDto>> getOrder(
            Authentication auth,
            @PathVariable String orderNumber) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(ApiResponse.success(orderService.getOrderByNumber(orderNumber, userId)));
    }

    @PostMapping("/{orderId}/cancel")
    @Operation(summary = "Sipariş iptal et")
    public ResponseEntity<ApiResponse<OrderDto>> cancelOrder(
            Authentication auth,
            @PathVariable Long orderId) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(ApiResponse.success("Sipariş iptal edildi", orderService.cancelOrder(orderId, userId)));
    }
}
