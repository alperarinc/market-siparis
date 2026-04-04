package com.market.service;

import com.market.domain.Category;
import com.market.dto.CategoryDto;
import com.market.dto.CreateCategoryRequest;
import com.market.dto.UpdateCategoryRequest;
import com.market.exception.BusinessException;
import com.market.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Cacheable("categories")
    public List<CategoryDto> getAllCategories() {
        return categoryRepository.findByParentIsNullAndActiveTrueOrderBySortOrder()
                .stream().map(CategoryDto::from).toList();
    }

    public List<CategoryDto> getAllCategoriesAdmin() {
        return categoryRepository.findAllByOrderBySortOrder()
                .stream().map(CategoryDto::from).toList();
    }

    public CategoryDto getCategoryBySlug(String slug) {
        return categoryRepository.findBySlug(slug)
                .map(CategoryDto::from)
                .orElseThrow(() -> BusinessException.notFound("Kategori"));
    }

    @Transactional
    @CacheEvict(value = "categories", allEntries = true)
    public CategoryDto createCategory(CreateCategoryRequest request) {
        if (categoryRepository.existsBySlug(toSlug(request.name()))) {
            throw BusinessException.conflict("Bu isimde bir kategori zaten mevcut");
        }

        Category category = Category.builder()
                .name(request.name())
                .slug(toSlug(request.name()))
                .description(request.description())
                .imageUrl(request.imageUrl())
                .icon(request.icon() != null ? request.icon() : "📦")
                .vatRate(request.vatRate() != null ? request.vatRate() : new java.math.BigDecimal("10"))
                .sortOrder(request.sortOrder() != null ? request.sortOrder() : 0)
                .active(true)
                .build();

        if (request.parentId() != null) {
            Category parent = categoryRepository.findById(request.parentId())
                    .orElseThrow(() -> BusinessException.notFound("Üst kategori"));
            category.setParent(parent);
        }

        return CategoryDto.from(categoryRepository.save(category));
    }

    @Transactional
    @CacheEvict(value = "categories", allEntries = true)
    public CategoryDto updateCategory(Long id, UpdateCategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> BusinessException.notFound("Kategori"));

        if (request.name() != null) {
            category.setName(request.name());
            category.setSlug(toSlug(request.name()));
        }
        if (request.description() != null) category.setDescription(request.description());
        if (request.imageUrl() != null) category.setImageUrl(request.imageUrl());
        if (request.icon() != null) category.setIcon(request.icon());
        if (request.vatRate() != null) category.setVatRate(request.vatRate());
        if (request.sortOrder() != null) category.setSortOrder(request.sortOrder());
        if (request.active() != null) category.setActive(request.active());
        if (request.parentId() != null) {
            Category parent = categoryRepository.findById(request.parentId())
                    .orElseThrow(() -> BusinessException.notFound("Üst kategori"));
            category.setParent(parent);
        }

        return CategoryDto.from(categoryRepository.save(category));
    }

    @Transactional
    @CacheEvict(value = "categories", allEntries = true)
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> BusinessException.notFound("Kategori"));

        if (!category.getProducts().isEmpty()) {
            throw BusinessException.unprocessable("Bu kategoride ürünler var. Önce ürünleri taşıyın.");
        }

        categoryRepository.delete(category);
    }

    private String toSlug(String name) {
        return name.toLowerCase()
                .replaceAll("[ğ]", "g").replaceAll("[ü]", "u").replaceAll("[ş]", "s")
                .replaceAll("[ı]", "i").replaceAll("[ö]", "o").replaceAll("[ç]", "c")
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
    }
}
