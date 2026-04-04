package com.market.service;

import com.market.domain.StaticPage;
import com.market.dto.StaticPageDto;
import com.market.exception.BusinessException;
import com.market.repository.StaticPageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StaticPageService {

    private final StaticPageRepository repository;

    public StaticPageDto getBySlug(String slug) {
        return repository.findBySlugAndActiveTrue(slug)
                .map(StaticPageDto::from)
                .orElseThrow(() -> BusinessException.notFound("Sayfa"));
    }

    public List<StaticPageDto> getActivePages() {
        return repository.findByActiveTrueOrderByTitleAsc()
                .stream().map(StaticPageDto::from).toList();
    }

    public List<StaticPageDto> getAllPagesAdmin() {
        return repository.findAllByOrderByTitleAsc()
                .stream().map(StaticPageDto::from).toList();
    }

    @Transactional
    public StaticPageDto updatePage(Long id, String title, String content, Boolean active) {
        StaticPage page = repository.findById(id)
                .orElseThrow(() -> BusinessException.notFound("Sayfa"));
        if (title != null) page.setTitle(title);
        if (content != null) page.setContent(content);
        if (active != null) page.setActive(active);
        return StaticPageDto.from(repository.save(page));
    }
}
