package com.market.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
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

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public VatanSmsService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
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

            String body = objectMapper.writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(VATAN_SMS_URL))
                    .timeout(Duration.ofSeconds(15))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                log.info("Vatan SMS gönderildi: {} -> {}", normalizedPhone, response.body());
                return true;
            } else {
                log.error("Vatan SMS hata: {} -> status={} body={}", normalizedPhone, response.statusCode(), response.body());
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

            String body = objectMapper.writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(VATAN_SMS_URL))
                    .timeout(Duration.ofSeconds(15))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            log.info("Vatan SMS toplu gönderim: {} adet -> status={} body={}", phones.size(), response.statusCode(), response.body());
            return response.statusCode() >= 200 && response.statusCode() < 300;
        } catch (Exception e) {
            log.error("Vatan SMS toplu gönderim hatası", e);
            return false;
        }
    }

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
