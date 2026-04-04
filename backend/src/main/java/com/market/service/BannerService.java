package com.market.service;

import com.market.domain.Banner;
import com.market.domain.BannerType;
import com.market.dto.BannerDto;
import com.market.dto.CreateBannerRequest;
import com.market.exception.BusinessException;
import com.market.repository.BannerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BannerService {

    private final BannerRepository bannerRepository;

    public List<BannerDto> getActiveBanners(BannerType type) {
        return bannerRepository.findByTypeAndActiveTrueOrderBySortOrder(type)
                .stream().map(BannerDto::from).toList();
    }

    public List<BannerDto> getAllBannersAdmin() {
        return bannerRepository.findAllByOrderByTypeAscSortOrderAsc()
                .stream().map(BannerDto::from).toList();
    }

    @Transactional
    public BannerDto createBanner(CreateBannerRequest request) {
        BannerType type = BannerType.valueOf(request.type());

        Banner banner = Banner.builder()
                .title(request.title())
                .imageUrl(request.imageUrl())
                .linkUrl(request.linkUrl())
                .type(type)
                .sortOrder(request.sortOrder() != null ? request.sortOrder() : 0)
                .active(true)
                .build();

        return BannerDto.from(bannerRepository.save(banner));
    }

    @Transactional
    public BannerDto updateBanner(Long id, CreateBannerRequest request) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> BusinessException.notFound("Banner"));

        if (request.title() != null) banner.setTitle(request.title());
        if (request.imageUrl() != null) banner.setImageUrl(request.imageUrl());
        if (request.linkUrl() != null) banner.setLinkUrl(request.linkUrl());
        if (request.type() != null) banner.setType(BannerType.valueOf(request.type()));
        if (request.sortOrder() != null) banner.setSortOrder(request.sortOrder());

        return BannerDto.from(bannerRepository.save(banner));
    }

    @Transactional
    public void toggleBanner(Long id) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> BusinessException.notFound("Banner"));
        banner.setActive(!banner.getActive());
        bannerRepository.save(banner);
    }

    @Transactional
    public void deleteBanner(Long id) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> BusinessException.notFound("Banner"));
        bannerRepository.delete(banner);
    }
}
