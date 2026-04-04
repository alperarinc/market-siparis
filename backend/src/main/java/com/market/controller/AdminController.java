package com.market.controller;

import com.market.domain.OrderStatus;
import com.market.dto.*;
import com.market.dto.BannerDto;
import com.market.dto.CreateBannerRequest;
import com.market.repository.OrderRepository;
import com.market.domain.SiteSetting;
import com.market.service.BannerService;
import com.market.dto.AdminProductDto;
import com.market.dto.StaticPageDto;
import com.market.service.SiteSettingService;
import com.market.service.StaticPageService;
import com.market.service.CategoryService;
import com.market.service.OrderService;
import com.market.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Yönetim paneli API'leri (ADMIN rolü gerektirir)")
public class AdminController {

    private final OrderService orderService;
    private final ProductService productService;
    private final CategoryService categoryService;
    private final BannerService bannerService;
    private final SiteSettingService siteSettingService;
    private final StaticPageService staticPageService;
    private final OrderRepository orderRepository;
    private final com.market.repository.UserRepository userRepository;

    // ==================== Dashboard ====================

    @GetMapping("/dashboard")
    @Operation(summary = "Dashboard istatistikleri")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboard() {
        LocalDateTime today = LocalDateTime.now().withHour(0).withMinute(0);
        LocalDateTime thisWeek = today.minusDays(7);

        long todayOrders = orderRepository.countOrdersSince(today);
        long weekOrders = orderRepository.countOrdersSince(thisWeek);
        BigDecimal todayRevenue = orderRepository.totalRevenueSince(today);
        BigDecimal weekRevenue = orderRepository.totalRevenueSince(thisWeek);
        List<ProductDto> lowStock = productService.getLowStockProducts();
        List<AdminProductDto> expiring = productService.getExpiringProducts();

        Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("todayOrders", todayOrders);
        stats.put("weekOrders", weekOrders);
        stats.put("todayRevenue", todayRevenue);
        stats.put("weekRevenue", weekRevenue);
        stats.put("lowStockCount", lowStock.size());
        stats.put("lowStockProducts", lowStock);
        stats.put("expiringCount", expiring.size());
        stats.put("expiringProducts", expiring);

        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    // ==================== Siparişler ====================

    @GetMapping("/orders")
    @Operation(summary = "Tüm siparişleri listele")
    public ResponseEntity<ApiResponse<Page<OrderDto>>> getAllOrders(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
                orderRepository.findAll(pageable).map(OrderDto::from)));
    }

    @PatchMapping("/orders/{orderId}/status")
    @Operation(summary = "Sipariş durumunu güncelle")
    public ResponseEntity<ApiResponse<OrderDto>> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam String status) {
        OrderStatus newStatus = OrderStatus.valueOf(status);
        return ResponseEntity.ok(ApiResponse.success(
                "Sipariş durumu güncellendi", orderService.updateOrderStatus(orderId, newStatus)));
    }

    // ==================== Kategoriler ====================

    @GetMapping("/categories")
    @Operation(summary = "Tüm kategorileri listele (aktif + pasif)")
    public ResponseEntity<ApiResponse<List<CategoryDto>>> getAllCategories() {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getAllCategoriesAdmin()));
    }

    @PostMapping("/categories")
    @Operation(summary = "Yeni kategori oluştur")
    public ResponseEntity<ApiResponse<CategoryDto>> createCategory(
            @Valid @RequestBody CreateCategoryRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Kategori oluşturuldu", categoryService.createCategory(request)));
    }

    @PutMapping("/categories/{id}")
    @Operation(summary = "Kategori güncelle")
    public ResponseEntity<ApiResponse<CategoryDto>> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCategoryRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Kategori güncellendi", categoryService.updateCategory(id, request)));
    }

    @DeleteMapping("/categories/{id}")
    @Operation(summary = "Kategori sil")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success("Kategori silindi", null));
    }

    // ==================== Bannerlar ====================

    @GetMapping("/banners")
    @Operation(summary = "Tüm bannerları listele")
    public ResponseEntity<ApiResponse<List<BannerDto>>> getAllBanners() {
        return ResponseEntity.ok(ApiResponse.success(bannerService.getAllBannersAdmin()));
    }

    @PostMapping("/banners")
    @Operation(summary = "Yeni banner oluştur")
    public ResponseEntity<ApiResponse<BannerDto>> createBanner(
            @Valid @RequestBody CreateBannerRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Banner oluşturuldu", bannerService.createBanner(request)));
    }

    @PutMapping("/banners/{id}")
    @Operation(summary = "Banner güncelle")
    public ResponseEntity<ApiResponse<BannerDto>> updateBanner(
            @PathVariable Long id,
            @Valid @RequestBody CreateBannerRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Banner güncellendi", bannerService.updateBanner(id, request)));
    }

    @PatchMapping("/banners/{id}/toggle")
    @Operation(summary = "Banner aktif/pasif yap")
    public ResponseEntity<ApiResponse<Void>> toggleBanner(@PathVariable Long id) {
        bannerService.toggleBanner(id);
        return ResponseEntity.ok(ApiResponse.success("Banner durumu güncellendi", null));
    }

    @DeleteMapping("/banners/{id}")
    @Operation(summary = "Banner sil")
    public ResponseEntity<ApiResponse<Void>> deleteBanner(@PathVariable Long id) {
        bannerService.deleteBanner(id);
        return ResponseEntity.ok(ApiResponse.success("Banner silindi", null));
    }

    // ==================== Site Ayarlari ====================

    @GetMapping("/settings")
    @Operation(summary = "Tüm site ayarlarını listele")
    public ResponseEntity<ApiResponse<List<SiteSetting>>> getSettings() {
        return ResponseEntity.ok(ApiResponse.success(siteSettingService.getAllSettingsAdmin()));
    }

    @PutMapping("/settings")
    @Operation(summary = "Site ayarlarını güncelle")
    public ResponseEntity<ApiResponse<Void>> updateSettings(@RequestBody Map<String, String> settings) {
        siteSettingService.updateSettings(settings);
        return ResponseEntity.ok(ApiResponse.success("Ayarlar güncellendi", null));
    }

    // ==================== Sayfalar ====================

    @GetMapping("/pages")
    @Operation(summary = "Tüm sayfaları listele")
    public ResponseEntity<ApiResponse<List<StaticPageDto>>> getAllPages() {
        return ResponseEntity.ok(ApiResponse.success(staticPageService.getAllPagesAdmin()));
    }

    @PutMapping("/pages/{id}")
    @Operation(summary = "Sayfa içeriğini güncelle")
    public ResponseEntity<ApiResponse<StaticPageDto>> updatePage(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        String title = (String) body.get("title");
        String content = (String) body.get("content");
        Boolean active = body.get("active") != null ? (Boolean) body.get("active") : null;
        return ResponseEntity.ok(ApiResponse.success(
                "Sayfa güncellendi", staticPageService.updatePage(id, title, content, active)));
    }

    // ==================== Ürünler ====================

    @GetMapping("/products")
    @Operation(summary = "Tüm ürünleri listele (admin)")
    public ResponseEntity<ApiResponse<List<AdminProductDto>>> getAllProductsAdmin() {
        return ResponseEntity.ok(ApiResponse.success(productService.getAllProductsAdmin()));
    }

    @PostMapping("/products")
    @Operation(summary = "Yeni ürün oluştur")
    public ResponseEntity<ApiResponse<AdminProductDto>> createProduct(
            @Valid @RequestBody CreateProductRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Ürün oluşturuldu", productService.createProduct(request)));
    }

    @PutMapping("/products/{productId}")
    @Operation(summary = "Ürün güncelle")
    public ResponseEntity<ApiResponse<AdminProductDto>> updateProduct(
            @PathVariable Long productId,
            @Valid @RequestBody CreateProductRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Ürün güncellendi", productService.updateProduct(productId, request)));
    }

    @DeleteMapping("/products/{productId}")
    @Operation(summary = "Ürün sil (pasife al)")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long productId) {
        productService.deleteProduct(productId);
        return ResponseEntity.ok(ApiResponse.success("Ürün silindi", null));
    }

    @PatchMapping("/products/{productId}/stock")
    @Operation(summary = "Stok güncelle")
    public ResponseEntity<ApiResponse<String>> updateStock(
            @PathVariable Long productId,
            @RequestParam int quantity) {
        productService.updateStock(productId, quantity);
        return ResponseEntity.ok(ApiResponse.success("Stok güncellendi", null));
    }

    @PatchMapping("/products/{productId}/expiry")
    @Operation(summary = "Son kullanma tarihi güncelle")
    public ResponseEntity<ApiResponse<String>> updateExpiry(
            @PathVariable Long productId,
            @RequestParam String date) {
        productService.updateExpiryDate(productId, java.time.LocalDate.parse(date));
        return ResponseEntity.ok(ApiResponse.success("Son kullanma tarihi güncellendi", null));
    }

    @GetMapping("/products/low-stock")
    @Operation(summary = "Düşük stoklu ürünler")
    public ResponseEntity<ApiResponse<List<ProductDto>>> getLowStockProducts() {
        return ResponseEntity.ok(ApiResponse.success(productService.getLowStockProducts()));
    }

    @GetMapping("/products/expiring")
    @Operation(summary = "SKT yaklaşan ürünler (7 gün)")
    public ResponseEntity<ApiResponse<List<AdminProductDto>>> getExpiringProducts() {
        return ResponseEntity.ok(ApiResponse.success(productService.getExpiringProducts()));
    }

    // ==================== Kullanıcılar ====================

    @GetMapping("/users")
    @Operation(summary = "Tüm kullanıcıları listele")
    public ResponseEntity<ApiResponse<List<UserDto>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.success(
                userRepository.findAll().stream().map(UserDto::from).toList()
        ));
    }

    @PostMapping("/users")
    @Operation(summary = "Yeni kullanıcı oluştur")
    public ResponseEntity<ApiResponse<UserDto>> createUser(@RequestBody Map<String, String> body) {
        String phone = body.get("phone");
        if (phone == null || phone.isBlank()) throw new com.market.exception.BusinessException("Telefon zorunludur");
        if (userRepository.findByPhone(phone).isPresent()) throw com.market.exception.BusinessException.conflict("Bu numara zaten kayıtlı");

        com.market.domain.User user = com.market.domain.User.builder()
                .phone(phone)
                .fullName(body.getOrDefault("fullName", ""))
                .email(body.get("email"))
                .role(com.market.domain.UserRole.valueOf(body.getOrDefault("role", "CUSTOMER")))
                .active(true)
                .build();
        return ResponseEntity.ok(ApiResponse.success("Kullanıcı oluşturuldu", UserDto.from(userRepository.save(user))));
    }

    @PutMapping("/users/{id}")
    @Operation(summary = "Kullanıcı güncelle")
    public ResponseEntity<ApiResponse<UserDto>> updateUser(@PathVariable Long id, @RequestBody Map<String, String> body) {
        com.market.domain.User user = userRepository.findById(id)
                .orElseThrow(() -> com.market.exception.BusinessException.notFound("Kullanıcı"));
        if (body.containsKey("fullName")) user.setFullName(body.get("fullName"));
        if (body.containsKey("email")) user.setEmail(body.get("email"));
        if (body.containsKey("role")) user.setRole(com.market.domain.UserRole.valueOf(body.get("role")));
        if (body.containsKey("active")) user.setActive(Boolean.parseBoolean(body.get("active")));
        return ResponseEntity.ok(ApiResponse.success("Kullanıcı güncellendi", UserDto.from(userRepository.save(user))));
    }

    @PatchMapping("/users/{id}/toggle")
    @Operation(summary = "Kullanıcı aktif/engelle")
    public ResponseEntity<ApiResponse<Void>> toggleUser(@PathVariable Long id) {
        com.market.domain.User user = userRepository.findById(id)
                .orElseThrow(() -> com.market.exception.BusinessException.notFound("Kullanıcı"));
        user.setActive(!user.getActive());
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success(user.getActive() ? "Kullanıcı aktif edildi" : "Kullanıcı engellendi", null));
    }

    @DeleteMapping("/users/{id}")
    @Operation(summary = "Kullanıcı sil")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        com.market.domain.User user = userRepository.findById(id)
                .orElseThrow(() -> com.market.exception.BusinessException.notFound("Kullanıcı"));
        user.setActive(false);
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success("Kullanıcı silindi", null));
    }
}
