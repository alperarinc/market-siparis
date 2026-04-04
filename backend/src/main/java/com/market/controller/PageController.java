package com.market.controller;

import com.market.dto.ApiResponse;
import com.market.dto.StaticPageDto;
import com.market.service.StaticPageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/pages")
@RequiredArgsConstructor
@Tag(name = "Sayfalar", description = "Statik sayfa API")
public class PageController {

    private final StaticPageService pageService;

    @GetMapping
    @Operation(summary = "Aktif sayfaları listele")
    public ResponseEntity<ApiResponse<List<StaticPageDto>>> getPages() {
        return ResponseEntity.ok(ApiResponse.success(pageService.getActivePages()));
    }

    @GetMapping("/{slug}")
    @Operation(summary = "Sayfa içeriğini getir")
    public ResponseEntity<ApiResponse<StaticPageDto>> getPage(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.success(pageService.getBySlug(slug)));
    }
}
