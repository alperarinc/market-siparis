package com.market.controller;

import com.market.dto.ApiResponse;
import com.market.service.SiteSettingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/settings")
@RequiredArgsConstructor
@Tag(name = "Site Ayarları", description = "Genel site ayarları")
public class SettingsController {

    private final SiteSettingService settingService;

    @GetMapping
    @Operation(summary = "Tüm site ayarlarını getir")
    public ResponseEntity<ApiResponse<Map<String, String>>> getSettings() {
        return ResponseEntity.ok(ApiResponse.success(settingService.getAllSettings()));
    }
}
