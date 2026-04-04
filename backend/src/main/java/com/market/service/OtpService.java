package com.market.service;

import com.market.exception.BusinessException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class OtpService {

    @Value("${otp.expiration-minutes:5}")
    private int expirationMinutes;

    @Value("${otp.length:6}")
    private int otpLength;

    @Value("${otp.max-attempts:3}")
    private int maxAttempts;

    @Value("${sms.provider:log}")
    private String smsProvider;

    @Value("${sms.netgsm.usercode:}")
    private String netgsmUsercode;

    @Value("${sms.netgsm.password:}")
    private String netgsmPassword;

    @Value("${sms.netgsm.msgheader:}")
    private String netgsmMsgheader;

    private record OtpEntry(String code, Instant expiresAt) {}
    private record AttemptEntry(int count, Instant expiresAt) {}

    private final Map<String, OtpEntry> otpStore = new ConcurrentHashMap<>();
    private final Map<String, AttemptEntry> attemptStore = new ConcurrentHashMap<>();

    public void generateAndSendOtp(String phone) {
        AttemptEntry attempts = attemptStore.get(phone);
        if (attempts != null && attempts.expiresAt().isAfter(Instant.now()) && attempts.count() >= maxAttempts) {
            throw BusinessException.tooManyRequests("Çok fazla deneme. Lütfen " + expirationMinutes + " dakika bekleyin.");
        }

        String otp = generateOtp();
        otpStore.put(phone, new OtpEntry(otp, Instant.now().plusSeconds(expirationMinutes * 60L)));

        String message = "Doğrulama kodunuz: " + otp + " (Geçerlilik: " + expirationMinutes + " dk)";

        if ("netgsm".equals(smsProvider)) {
            sendViaNetsm(phone, message);
        } else {
            log.warn("=== DEV MODU: SMS gönderilmedi ===");
            log.warn("Telefon: {} | OTP: {}", phone, otp);
            log.warn("==================================");
        }
    }

    private void sendViaNetsm(String phone, String message) {
        try {
            RestTemplate rest = new RestTemplate();
            String url = String.format(
                "https://api.netgsm.com.tr/sms/send/get/?usercode=%s&password=%s&gsmno=%s&message=%s&msgheader=%s",
                netgsmUsercode, netgsmPassword, phone, message, netgsmMsgheader
            );
            String response = rest.getForObject(url, String.class);
            log.info("Netgsm SMS yanıtı: {} -> {}", phone, response);

            if (response != null && !response.startsWith("00") && !response.startsWith("01") && !response.startsWith("02")) {
                log.error("Netgsm SMS gönderilemedi: {}", response);
                throw new BusinessException("SMS gönderilemedi. Lütfen tekrar deneyin.");
            }
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            log.error("SMS gönderim hatası", e);
            throw BusinessException.serviceUnavailable("SMS servisi şu an kullanılamıyor.");
        }
    }

    public boolean verifyOtp(String phone, String inputOtp) {
        OtpEntry entry = otpStore.get(phone);

        if (entry == null || entry.expiresAt().isBefore(Instant.now())) {
            otpStore.remove(phone);
            throw BusinessException.unauthorized("OTP süresi dolmuş. Yeni kod talep edin.");
        }

        if (entry.code().equals(inputOtp)) {
            otpStore.remove(phone);
            attemptStore.remove(phone);
            return true;
        }

        attemptStore.compute(phone, (k, v) -> {
            int count = (v != null && v.expiresAt().isAfter(Instant.now())) ? v.count() + 1 : 1;
            return new AttemptEntry(count, Instant.now().plusSeconds(expirationMinutes * 60L));
        });
        return false;
    }

    @Scheduled(fixedRate = 300_000) // 5 dakikada bir temizlik
    public void cleanExpiredEntries() {
        Instant now = Instant.now();
        otpStore.entrySet().removeIf(e -> e.getValue().expiresAt().isBefore(now));
        attemptStore.entrySet().removeIf(e -> e.getValue().expiresAt().isBefore(now));
    }

    private String generateOtp() {
        SecureRandom random = new SecureRandom();
        StringBuilder otp = new StringBuilder();
        for (int i = 0; i < otpLength; i++) {
            otp.append(random.nextInt(10));
        }
        return otp.toString();
    }
}
