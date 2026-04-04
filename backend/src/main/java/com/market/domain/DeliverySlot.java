package com.market.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "delivery_slots")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class DeliverySlot extends BaseEntity {

    @Column(name = "slot_date", nullable = false)
    private LocalDate slotDate;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "max_orders", nullable = false)
    @Builder.Default
    private Integer maxOrders = 10;

    @Column(name = "current_orders", nullable = false)
    @Builder.Default
    private Integer currentOrders = 0;

    @Column(name = "active", nullable = false)
    @Builder.Default
    private Boolean active = true;

    public boolean isAvailable() {
        return active && currentOrders < maxOrders;
    }
}
