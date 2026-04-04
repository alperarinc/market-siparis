package com.market.messaging;

import com.market.domain.Order;
import com.market.domain.User;
import com.market.repository.OrderRepository;
import com.market.repository.UserRepository;
import com.market.service.OrderService;
import com.market.service.SiteSettingService;
import com.market.service.VatanSmsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.AbstractMap;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
@Slf4j
@RequiredArgsConstructor
public class NotificationListener {

    private final VatanSmsService vatanSmsService;
    private final SiteSettingService siteSettingService;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    @Async
    @EventListener
    public void handleOrderEvent(OrderService.OrderEvent event) {
        try {
            Map<String, String> settings = siteSettingService.getAllSettings();
            boolean smsEnabled = "true".equals(settings.get("sms_notification_enabled"));

            if (!smsEnabled) {
                log.info("SMS bildirimleri kapalı. Sipariş #{}", event.orderNumber());
                return;
            }

            String adminPhone = settings.get("admin_phone");
            String customerPhone = getCustomerPhone(event.userId());

            switch (event.status()) {
                case "CREATED" -> sendOrderCreatedSms(event, adminPhone, customerPhone);
                case "CONFIRMED" -> sendStatusSms(customerPhone, event.orderNumber(), "onaylandı ve hazırlanıyor");
                case "SHIPPED" -> sendStatusSms(customerPhone, event.orderNumber(), "yola çıktı");
                case "DELIVERED" -> sendStatusSms(customerPhone, event.orderNumber(), "teslim edildi");
                case "CANCELLED" -> sendStatusSms(customerPhone, event.orderNumber(), "iptal edildi");
                default -> log.info("Sipariş durum değişikliği: #{} -> {}", event.orderNumber(), event.status());
            }
        } catch (Exception e) {
            log.error("SMS bildirim hatası: sipariş #{}", event.orderNumber(), e);
        }
    }

    private void sendOrderCreatedSms(OrderService.OrderEvent event, String adminPhone, String customerPhone) {
        Order order = orderRepository.findById(event.orderId()).orElse(null);
        String totalAmount = order != null ? order.getTotalAmount().toPlainString() : "?";

        List<Map.Entry<String, String>> messages = new ArrayList<>();

        // Müşteriye SMS
        if (customerPhone != null) {
            String customerMsg = String.format(
                    "Siparişiniz alındı! Sipariş No: %s, Tutar: %s TL. Siparişiniz en kısa sürede hazırlanacaktır.",
                    event.orderNumber(), totalAmount);
            messages.add(new AbstractMap.SimpleEntry<>(customerPhone, customerMsg));
        }

        // Admin'e SMS
        if (adminPhone != null && !adminPhone.isBlank()) {
            String adminMsg = String.format(
                    "Yeni sipariş! No: %s, Tutar: %s TL. Kontrol panelinden detayları görebilirsiniz.",
                    event.orderNumber(), totalAmount);
            messages.add(new AbstractMap.SimpleEntry<>(adminPhone, adminMsg));
        }

        if (!messages.isEmpty()) {
            vatanSmsService.sendBulkSms(messages);
            log.info("Sipariş #{} SMS bildirimleri gönderildi ({} adet)", event.orderNumber(), messages.size());
        }
    }

    private void sendStatusSms(String customerPhone, String orderNumber, String statusText) {
        if (customerPhone == null) return;
        String message = String.format("Sipariş No: %s - Siparişiniz %s. Bizi tercih ettiğiniz için teşekkürler!", orderNumber, statusText);
        vatanSmsService.sendSms(customerPhone, message);
        log.info("Sipariş #{} durum SMS'i gönderildi: {}", orderNumber, statusText);
    }

    private String getCustomerPhone(Long userId) {
        return userRepository.findById(userId)
                .map(User::getPhone)
                .orElse(null);
    }
}
