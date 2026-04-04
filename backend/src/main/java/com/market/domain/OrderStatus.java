package com.market.domain;

public enum OrderStatus {
    PENDING,          // Beklemede
    CONFIRMED,        // Onaylandı
    PREPARING,        // Hazırlanıyor
    READY,            // Teslimata hazır
    OUT_FOR_DELIVERY, // Yolda
    DELIVERED,        // Teslim edildi
    CANCELLED         // İptal edildi
}
