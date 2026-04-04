package com.market.repository;

import com.market.domain.StaticPage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StaticPageRepository extends JpaRepository<StaticPage, Long> {
    Optional<StaticPage> findBySlugAndActiveTrue(String slug);
    List<StaticPage> findAllByOrderByTitleAsc();
    List<StaticPage> findByActiveTrueOrderByTitleAsc();
}
