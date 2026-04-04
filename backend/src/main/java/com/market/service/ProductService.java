package com.market.service;

import com.market.domain.Product;
import com.market.domain.Category;
import com.market.dto.AdminProductDto;
import com.market.dto.CreateProductRequest;
import com.market.dto.ProductDto;
import com.market.repository.CategoryRepository;
import com.market.exception.BusinessException;
import com.market.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Cacheable(value = "products", key = "#pageable.pageNumber + '-' + #pageable.pageSize")
    public Page<ProductDto> getAllProducts(Pageable pageable) {
        return productRepository.findByActiveTrue(pageable).map(ProductDto::from);
    }

    public Page<ProductDto> getProductsByCategory(Long categoryId, Pageable pageable) {
        return productRepository.findByActiveTrueAndCategoryId(categoryId, pageable).map(ProductDto::from);
    }

    public ProductDto getProductBySlug(String slug) {
        return productRepository.findBySlug(slug)
                .map(ProductDto::from)
                .orElseThrow(() -> BusinessException.notFound("Ürün"));
    }

    public ProductDto getProductById(Long id) {
        return productRepository.findById(id)
                .map(ProductDto::from)
                .orElseThrow(() -> BusinessException.notFound("Ürün"));
    }

    @Cacheable(value = "products", key = "'featured'")
    public List<ProductDto> getFeaturedProducts() {
        return productRepository.findByFeaturedTrueAndActiveTrue()
                .stream().map(ProductDto::from).toList();
    }

    public Page<ProductDto> searchProducts(String query, Pageable pageable) {
        return productRepository.searchProducts(query, pageable).map(ProductDto::from);
    }

    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public void updateStock(Long productId, int quantityChange) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> BusinessException.notFound("Ürün"));
        int newStock = product.getStockQuantity() + quantityChange;
        if (newStock < 0) {
            throw BusinessException.unprocessable("Yetersiz stok: " + product.getName());
        }
        product.setStockQuantity(newStock);
        productRepository.save(product);
    }

    public List<ProductDto> getLowStockProducts() {
        return productRepository.findLowStockProducts()
                .stream().map(ProductDto::from).toList();
    }

    public List<AdminProductDto> getAllProductsAdmin() {
        return productRepository.findAll()
                .stream().map(AdminProductDto::from).toList();
    }

    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public void updateExpiryDate(Long productId, java.time.LocalDate date) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> BusinessException.notFound("Ürün"));
        product.setExpiryDate(date);
        productRepository.save(product);
    }

    public List<AdminProductDto> getExpiringProducts() {
        return productRepository.findExpiringProducts(java.time.LocalDate.now().plusDays(7))
                .stream().map(AdminProductDto::from).toList();
    }

    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public AdminProductDto createProduct(CreateProductRequest req) {
        Category category = categoryRepository.findById(req.categoryId())
                .orElseThrow(() -> BusinessException.notFound("Kategori"));

        String slug = toSlug(req.name());
        if (productRepository.findBySlug(slug).isPresent()) {
            slug = slug + "-" + System.currentTimeMillis() % 10000;
        }

        Product product = Product.builder()
                .name(req.name())
                .slug(slug)
                .description(req.description())
                .barcode(req.barcode())
                .price(req.price())
                .discountedPrice(req.discountedPrice())
                .priceIncludesVat(req.priceIncludesVat() != null ? req.priceIncludesVat() : true)
                .unit(req.unit() != null ? req.unit() : "adet")
                .stockQuantity(req.stockQuantity() != null ? req.stockQuantity() : 0)
                .minStockLevel(req.minStockLevel() != null ? req.minStockLevel() : 5)
                .imageUrl(req.imageUrl())
                .featured(req.featured() != null ? req.featured() : false)
                .category(category)
                .brand(req.brand())
                .origin(req.origin())
                .weightInfo(req.weightInfo())
                .storageConditions(req.storageConditions())
                .ingredients(req.ingredients())
                .expiryDate(req.expiryDate() != null ? java.time.LocalDate.parse(req.expiryDate()) : null)
                .active(true)
                .build();

        return AdminProductDto.from(productRepository.save(product));
    }

    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public AdminProductDto updateProduct(Long id, CreateProductRequest req) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> BusinessException.notFound("Ürün"));

        if (req.name() != null) product.setName(req.name());
        if (req.description() != null) product.setDescription(req.description());
        if (req.barcode() != null) product.setBarcode(req.barcode());
        if (req.price() != null) product.setPrice(req.price());
        if (req.discountedPrice() != null) product.setDiscountedPrice(req.discountedPrice());
        if (req.priceIncludesVat() != null) product.setPriceIncludesVat(req.priceIncludesVat());
        if (req.unit() != null) product.setUnit(req.unit());
        if (req.stockQuantity() != null) product.setStockQuantity(req.stockQuantity());
        if (req.minStockLevel() != null) product.setMinStockLevel(req.minStockLevel());
        if (req.imageUrl() != null) product.setImageUrl(req.imageUrl());
        if (req.featured() != null) product.setFeatured(req.featured());
        if (req.brand() != null) product.setBrand(req.brand());
        if (req.origin() != null) product.setOrigin(req.origin());
        if (req.weightInfo() != null) product.setWeightInfo(req.weightInfo());
        if (req.storageConditions() != null) product.setStorageConditions(req.storageConditions());
        if (req.ingredients() != null) product.setIngredients(req.ingredients());
        if (req.expiryDate() != null) product.setExpiryDate(java.time.LocalDate.parse(req.expiryDate()));
        if (req.categoryId() != null) {
            Category category = categoryRepository.findById(req.categoryId())
                    .orElseThrow(() -> BusinessException.notFound("Kategori"));
            product.setCategory(category);
        }

        return AdminProductDto.from(productRepository.save(product));
    }

    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> BusinessException.notFound("Ürün"));
        product.setActive(false);
        productRepository.save(product);
    }

    private String toSlug(String name) {
        return name.toLowerCase()
                .replaceAll("[ğ]", "g").replaceAll("[ü]", "u").replaceAll("[ş]", "s")
                .replaceAll("[ı]", "i").replaceAll("[ö]", "o").replaceAll("[ç]", "c")
                .replaceAll("[^a-z0-9\\s-]", "").replaceAll("\\s+", "-")
                .replaceAll("-+", "-").replaceAll("^-|-$", "");
    }
}
