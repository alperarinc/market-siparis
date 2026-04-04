package com.market.controller;

import com.market.domain.BannerType;
import com.market.dto.ApiResponse;
import com.market.dto.BannerDto;
import com.market.service.BannerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/banners")
@RequiredArgsConstructor
@Tag(name = "Bannerlar", description = "Anasayfa banner/slider API")
public class BannerController {

    private final BannerService bannerService;

    @GetMapping("/hero")
    @Operation(summary = "Aktif hero slider bannerlarını getir")
    public ResponseEntity<ApiResponse<List<BannerDto>>> getHeroBanners() {
        return ResponseEntity.ok(ApiResponse.success(bannerService.getActiveBanners(BannerType.HERO)));
    }

    @GetMapping("/promo")
    @Operation(summary = "Aktif promosyon bannerlarını getir")
    public ResponseEntity<ApiResponse<List<BannerDto>>> getPromoBanners() {
        return ResponseEntity.ok(ApiResponse.success(bannerService.getActiveBanners(BannerType.PROMO)));
    }
}
