package com.market.service;

import com.market.domain.SiteSetting;
import com.market.repository.SiteSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SiteSettingService {

    private final SiteSettingRepository repository;

    @Cacheable("settings")
    public Map<String, String> getAllSettings() {
        return repository.findAll().stream()
                .collect(Collectors.toMap(SiteSetting::getKey, SiteSetting::getValue));
    }

    public java.util.List<SiteSetting> getAllSettingsAdmin() {
        return repository.findAll();
    }

    @Transactional
    @CacheEvict(value = "settings", allEntries = true)
    public void updateSetting(String key, String value) {
        repository.findById(key).ifPresent(s -> {
            s.setValue(value);
            repository.save(s);
        });
    }

    @Transactional
    @CacheEvict(value = "settings", allEntries = true)
    public void updateSettings(Map<String, String> settings) {
        settings.forEach((key, value) -> {
            repository.findById(key).ifPresent(s -> {
                s.setValue(value);
                repository.save(s);
            });
        });
    }
}
