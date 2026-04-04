package com.market.controller;

import com.market.domain.Address;
import com.market.domain.User;
import com.market.dto.ApiResponse;
import com.market.exception.BusinessException;
import com.market.repository.AddressRepository;
import com.market.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/addresses")
@RequiredArgsConstructor
@Tag(name = "Adresler", description = "Teslimat adresi yönetimi")
public class AddressController {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    @GetMapping
    @Operation(summary = "Adreslerimi listele")
    public ResponseEntity<ApiResponse<List<Address>>> getAddresses(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(ApiResponse.success(addressRepository.findByUserId(userId)));
    }

    @PostMapping
    @Operation(summary = "Yeni adres ekle")
    public ResponseEntity<ApiResponse<Address>> addAddress(
            Authentication auth,
            @RequestBody Map<String, Object> body) {
        Long userId = (Long) auth.getPrincipal();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> BusinessException.notFound("Kullanıcı"));

        Address address = Address.builder()
                .user(user)
                .title(body.getOrDefault("title", "Ev").toString())
                .fullAddress(body.get("fullAddress").toString())
                .district(body.getOrDefault("district", "").toString())
                .city(body.getOrDefault("city", "").toString())
                .buildingNo(body.getOrDefault("buildingNo", "").toString())
                .floorNo(body.getOrDefault("floorNo", "").toString())
                .doorNo(body.getOrDefault("doorNo", "").toString())
                .directions(body.getOrDefault("directions", "").toString())
                .isDefault(Boolean.parseBoolean(body.getOrDefault("isDefault", "false").toString()))
                .build();

        return ResponseEntity.ok(ApiResponse.success("Adres kaydedildi", addressRepository.save(address)));
    }

    @DeleteMapping("/{addressId}")
    @Operation(summary = "Adres sil")
    public ResponseEntity<ApiResponse<String>> deleteAddress(
            Authentication auth,
            @PathVariable Long addressId) {
        Long userId = (Long) auth.getPrincipal();
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> BusinessException.notFound("Adres"));
        if (!address.getUser().getId().equals(userId)) {
            throw BusinessException.forbidden("Bu adres size ait değil");
        }
        addressRepository.delete(address);
        return ResponseEntity.ok(ApiResponse.success("Adres silindi", null));
    }
}
