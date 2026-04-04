package com.market.dto;

import com.market.domain.Banner;

public record BannerDto(
        Long id,
        String title,
        String imageUrl,
        String linkUrl,
        String type,
        Integer sortOrder,
        Boolean active
) {
    public static BannerDto from(Banner banner) {
        return new BannerDto(
                banner.getId(),
                banner.getTitle(),
                banner.getImageUrl(),
                banner.getLinkUrl(),
                banner.getType().name(),
                banner.getSortOrder(),
                banner.getActive()
        );
    }
}
