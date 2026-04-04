package com.market.controller;

import com.market.dto.ApiResponse;
import com.market.service.FileStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/admin/upload")
@RequiredArgsConstructor
@Tag(name = "Dosya Yükleme", description = "Görsel yükleme API (ADMIN)")
public class UploadController {

    private final FileStorageService fileStorageService;

    @PostMapping(value = "/product", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Ürün görseli yükle (800x800 önerilen)")
    public ResponseEntity<ApiResponse<String>> uploadProduct(@RequestParam("file") MultipartFile file) {
        String url = fileStorageService.upload(file, "products");
        return ResponseEntity.ok(ApiResponse.success("Görsel yüklendi", url));
    }

    @PostMapping(value = "/banner", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Banner görseli yükle (HERO: 1200x400, PROMO: 1200x120)")
    public ResponseEntity<ApiResponse<String>> uploadBanner(@RequestParam("file") MultipartFile file) {
        String url = fileStorageService.upload(file, "banners");
        return ResponseEntity.ok(ApiResponse.success("Görsel yüklendi", url));
    }

    @PostMapping(value = "/category", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Kategori görseli yükle (400x400 önerilen)")
    public ResponseEntity<ApiResponse<String>> uploadCategory(@RequestParam("file") MultipartFile file) {
        String url = fileStorageService.upload(file, "categories");
        return ResponseEntity.ok(ApiResponse.success("Görsel yüklendi", url));
    }
}
