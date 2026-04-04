package com.market.repository;

import com.market.domain.DeliverySlot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface DeliverySlotRepository extends JpaRepository<DeliverySlot, Long> {
    List<DeliverySlot> findBySlotDateAndActiveTrueOrderByStartTime(LocalDate date);
    List<DeliverySlot> findBySlotDateBetweenAndActiveTrueOrderBySlotDateAscStartTimeAsc(LocalDate start, LocalDate end);
}
