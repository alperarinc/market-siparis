package com.market.repository;

import com.market.domain.Banner;
import com.market.domain.BannerType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BannerRepository extends JpaRepository<Banner, Long> {
    List<Banner> findByTypeAndActiveTrueOrderBySortOrder(BannerType type);
    List<Banner> findAllByOrderByTypeAscSortOrderAsc();
}
