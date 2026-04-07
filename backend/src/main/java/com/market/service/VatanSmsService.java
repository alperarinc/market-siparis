package com.market.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.http.*;

import java.time.Duration;
import java.util.*;

@Service
@Slf4j
public class VatanSmsService {

    private static final String VATAN_SMS_URL = "https://api.vatansms.net/api/v1/NtoN";

    @Value("${sms.vatan.api-id:}")
    private String apiId;

    @Value("${sms.vatan.api-key:}")
    private String apiKey;

    @Value("${sms.vatan.sender:ALPER ARINC}")
    private String sender;

    @Value("${sms.provider:log}")
    private String smsProvider;

    private final RestClient restClient;

    public VatanSmsService() {
        var factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(10));
        factory.setReadTimeout(Duration.ofSeconds(15));

        this.restClient = RestClient.builder()
                .baseUrl(VATAN_SMS_URL)
                .requestFactory(factory)
                .build();
    }

    public boolean sendSms(String phone, String message) {
        if (!"vatan".equals(smsProvider)) {
            log.warn("=== DEV MODU: SMS gönderilmedi ===");
            log.warn("Telefon: {} | Mesaj: {}", phone, message);
            log.warn("==================================");
            return true;
        }

        try {
            String normalizedPhone = normalizePhone(phone);

            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("api_id", apiId);
            payload.put("api_key", apiKey);
            payload.put("sender", sender);
            payload.put("message_type", "normal");
            payload.put("message_content_type", "bilgi");
            payload.put("phones", List.of(Map.of(
                    "phone", normalizedPhone,
                    "message", message
            )));

            var response = restClient.post()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .toEntity(String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("Vatan SMS gönderildi: {} -> {}", normalizedPhone, response.getBody());
                return true;
            } else {
                log.error("Vatan SMS hata: {} -> {}", normalizedPhone, response.getBody());
                return false;
            }
        } catch (Exception e) {
            log.error("Vatan SMS gönderim hatası: telefon={}", phone, e);
            return false;
        }
    }

    public boolean sendBulkSms(List<Map.Entry<String, String>> phoneMessagePairs) {
        if (!"vatan".equals(smsProvider)) {
            phoneMessagePairs.forEach(p ->
                    log.warn("DEV MODU SMS -> {} : {}", p.getKey(), p.getValue()));
            return true;
        }

        try {
            List<Map<String, String>> phones = phoneMessagePairs.stream()
                    .map(p -> Map.of(
                            "phone", normalizePhone(p.getKey()),
                            "message", p.getValue()
                    ))
                    .toList();

            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("api_id", apiId);
            payload.put("api_key", apiKey);
            payload.put("sender", sender);
            payload.put("message_type", "normal");
            payload.put("message_content_type", "bilgi");
            payload.put("phones", phones);

            var response = restClient.post()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .toEntity(String.class);

            log.info("Vatan SMS toplu gönderim: {} adet -> {}", phones.size(), response.getBody());
            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            log.error("Vatan SMS toplu gönderim hatası", e);
            return false;
        }
    }

    /**
     * Telefon numarasını 5XXXXXXXXX formatına normalize eder.
     */
    private String normalizePhone(String phone) {
        if (phone == null) return "";
        String cleaned = phone.replaceAll("[\\s\\-\\(\\)\\+]", "");
        if (cleaned.startsWith("90") && cleaned.length() == 12) {
            cleaned = cleaned.substring(2);
        }
        if (cleaned.startsWith("0") && cleaned.length() == 11) {
            cleaned = cleaned.substring(1);
        }
        return cleaned;
    }
}
