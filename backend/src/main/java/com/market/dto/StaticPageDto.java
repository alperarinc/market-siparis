package com.market.dto;

import com.market.domain.StaticPage;

public record StaticPageDto(
        Long id,
        String slug,
        String title,
        String content,
        Boolean active
) {
    public static StaticPageDto from(StaticPage page) {
        return new StaticPageDto(page.getId(), page.getSlug(), page.getTitle(), page.getContent(), page.getActive());
    }
}
