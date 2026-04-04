package com.market.messaging;

import com.market.service.OrderService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class NotificationListener {

    @Async
    @EventListener
    public void handleOrderEvent(OrderService.OrderEvent event) {
        switch (event.status()) {
            case "CREATED" -> log.info("Yeni sipariş bildirimi: Sipariş #{}", event.orderNumber());
            default -> log.info("Sipariş durum değişikliği: ID={}, Yeni durum={}",
                    event.orderId(), event.status());
        }
        // TODO: Müşteriye SMS gönder
        // TODO: Admin'e push notification gönder
    }
}
