package com.market.controller;

import com.market.dto.ApiResponse;
import com.market.dto.CartItemRequest;
import com.market.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
@Tag(name = "Sepet", description = "Alışveriş sepeti yönetimi")
public class CartController {

    private final CartService cartService;

    @GetMapping
    @Operation(summary = "Sepeti getir")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCart(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(ApiResponse.success(cartService.getCart(userId)));
    }

    @PostMapping("/add")
    @Operation(summary = "Sepete ürün ekle")
    public ResponseEntity<ApiResponse<String>> addItem(
            Authentication auth,
            @Valid @RequestBody CartItemRequest request) {
        Long userId = (Long) auth.getPrincipal();
        cartService.addItem(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Ürün sepete eklendi", null));
    }

    @PutMapping("/{productId}")
    @Operation(summary = "Sepetteki ürün miktarını güncelle")
    public ResponseEntity<ApiResponse<String>> updateItem(
            Authentication auth,
            @PathVariable Long productId,
            @RequestParam BigDecimal quantity) {
        Long userId = (Long) auth.getPrincipal();
        cartService.updateItem(userId, productId, quantity);
        return ResponseEntity.ok(ApiResponse.success("Sepet güncellendi", null));
    }

    @DeleteMapping("/{productId}")
    @Operation(summary = "Sepetten ürün çıkar")
    public ResponseEntity<ApiResponse<String>> removeItem(
            Authentication auth,
            @PathVariable Long productId) {
        Long userId = (Long) auth.getPrincipal();
        cartService.removeItem(userId, productId);
        return ResponseEntity.ok(ApiResponse.success("Ürün sepetten çıkarıldı", null));
    }

    @DeleteMapping
    @Operation(summary = "Sepeti temizle")
    public ResponseEntity<ApiResponse<String>> clearCart(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        cartService.clearCart(userId);
        return ResponseEntity.ok(ApiResponse.success("Sepet temizlendi", null));
    }
}
