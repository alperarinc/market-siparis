package com.market.service;

import com.market.domain.*;
import com.market.dto.CreateOrderRequest;
import com.market.dto.OrderDto;
import com.market.exception.BusinessException;
import com.market.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final AddressRepository addressRepository;
    private final UserRepository userRepository;
    private final CartService cartService;
    private final ApplicationEventPublisher eventPublisher;

    private static final BigDecimal DELIVERY_FEE = new BigDecimal("29.90");
    private static final BigDecimal FREE_DELIVERY_THRESHOLD = new BigDecimal("200.00");
    private static final BigDecimal MIN_ORDER_AMOUNT = new BigDecimal("50.00");

    private static final AtomicLong orderSeq = new AtomicLong(System.currentTimeMillis() % 100000);

    @Transactional
    public OrderDto createOrder(Long userId, CreateOrderRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> BusinessException.notFound("Kullanıcı"));

        Address address = addressRepository.findById(request.addressId())
                .orElseThrow(() -> BusinessException.notFound("Adres"));

        if (!address.getUser().getId().equals(userId)) {
            throw BusinessException.forbidden("Bu adres size ait değil");
        }

        Map<String, Object> cartItems = cartService.getCart(userId);
        if (cartItems.isEmpty()) {
            throw BusinessException.unprocessable("Sepetiniz boş");
        }

        String orderNumber = generateOrderNumber();
        Order order = Order.builder()
                .orderNumber(orderNumber)
                .user(user)
                .deliveryAddress(address)
                .status(OrderStatus.PENDING)
                .paymentMethod(PaymentMethod.valueOf(request.paymentMethod()))
                .note(request.note())
                .estimatedDeliveryTime(LocalDateTime.now().plusMinutes(45))
                .build();

        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal totalVat = BigDecimal.ZERO;

        for (Map.Entry<String, Object> entry : cartItems.entrySet()) {
            Long productId = Long.parseLong(entry.getKey());
            BigDecimal quantity = new BigDecimal(entry.getValue().toString());

            Product product = productRepository.findByIdForUpdate(productId)
                    .orElseThrow(() -> BusinessException.notFound("Ürün"));

            if (!product.getActive()) {
                throw BusinessException.unprocessable("Ürün artık aktif değil: " + product.getName());
            }

            BigDecimal stockAsBigDecimal = BigDecimal.valueOf(product.getStockQuantity());
            if (stockAsBigDecimal.compareTo(quantity) < 0) {
                throw BusinessException.unprocessable("Yetersiz stok: " + product.getName()
                        + " (Stok: " + product.getStockQuantity() + " " + product.getUnit() + ")");
            }

            BigDecimal unitPrice = product.getEffectivePrice();
            BigDecimal totalPrice = unitPrice.multiply(quantity).setScale(3, RoundingMode.HALF_UP);

            // KDV hesapla
            BigDecimal vatRate = product.getCategory().getVatRate() != null
                    ? product.getCategory().getVatRate() : BigDecimal.TEN;
            BigDecimal vatMultiplier = BigDecimal.ONE.add(vatRate.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP));
            BigDecimal itemVat;
            if (product.getPriceIncludesVat()) {
                itemVat = totalPrice.subtract(totalPrice.divide(vatMultiplier, 3, RoundingMode.HALF_UP));
            } else {
                itemVat = totalPrice.multiply(vatRate).divide(BigDecimal.valueOf(100), 3, RoundingMode.HALF_UP);
                totalPrice = totalPrice.add(itemVat);
            }

            OrderItem item = OrderItem.builder()
                    .product(product)
                    .productName(product.getName())
                    .quantity(quantity)
                    .unit(product.getUnit())
                    .unitPrice(unitPrice)
                    .totalPrice(totalPrice)
                    .vatRate(vatRate)
                    .vatAmount(itemVat)
                    .build();

            order.addItem(item);
            subtotal = subtotal.add(totalPrice);
            totalVat = totalVat.add(itemVat);

            int newStock = product.getStockQuantity() - quantity.intValue();
            product.setStockQuantity(Math.max(0, newStock));
            productRepository.save(product);
        }

        if (subtotal.compareTo(MIN_ORDER_AMOUNT) < 0) {
            throw BusinessException.unprocessable("Minimum sipariş tutarı ₺" + MIN_ORDER_AMOUNT.toPlainString());
        }

        BigDecimal deliveryFee = subtotal.compareTo(FREE_DELIVERY_THRESHOLD) >= 0
                ? BigDecimal.ZERO : DELIVERY_FEE;

        order.setSubtotal(subtotal);
        order.setDeliveryFee(deliveryFee);
        order.setTotalVat(totalVat);
        order.setTotalAmount(subtotal.add(deliveryFee));

        Order savedOrder = orderRepository.save(order);

        cartService.clearCart(userId);

        eventPublisher.publishEvent(new OrderEvent(savedOrder.getId(), orderNumber, userId, "CREATED"));

        log.info("Yeni sipariş oluşturuldu: {} - Tutar: ₺{}", orderNumber, savedOrder.getTotalAmount());
        return OrderDto.from(savedOrder);
    }

    public Page<OrderDto> getUserOrders(Long userId, Pageable pageable) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable).map(OrderDto::from);
    }

    public OrderDto getOrderByNumber(String orderNumber, Long userId) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> BusinessException.notFound("Sipariş"));

        if (!order.getUser().getId().equals(userId)) {
            throw BusinessException.forbidden("Bu sipariş size ait değil");
        }

        return OrderDto.from(order);
    }

    @Transactional
    public OrderDto updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> BusinessException.notFound("Sipariş"));

        order.setStatus(newStatus);
        if (newStatus == OrderStatus.DELIVERED) {
            order.setDeliveredAt(LocalDateTime.now());
            if (order.getPaymentMethod() == PaymentMethod.CASH_ON_DELIVERY) {
                order.setPaymentStatus(PaymentStatus.PAID);
            }
        }

        Order updated = orderRepository.save(order);

        eventPublisher.publishEvent(new OrderEvent(orderId, order.getOrderNumber(),
                order.getUser().getId(), newStatus.name()));

        return OrderDto.from(updated);
    }

    @Transactional
    public OrderDto cancelOrder(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> BusinessException.notFound("Sipariş"));

        if (!order.getUser().getId().equals(userId)) {
            throw BusinessException.forbidden("Bu sipariş size ait değil");
        }

        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.CONFIRMED) {
            throw BusinessException.unprocessable("Bu sipariş artık iptal edilemez");
        }

        for (OrderItem item : order.getItems()) {
            Product product = productRepository.findByIdForUpdate(item.getProduct().getId())
                    .orElseThrow(() -> BusinessException.notFound("Ürün"));
            product.setStockQuantity(product.getStockQuantity() + item.getQuantity().intValue());
            productRepository.save(product);
        }

        order.setStatus(OrderStatus.CANCELLED);
        return OrderDto.from(orderRepository.save(order));
    }

    private String generateOrderNumber() {
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyMMdd"));
        long seq = orderSeq.incrementAndGet() % 100000;
        return String.format("ORD-%s-%05d", date, seq);
    }

    public record OrderEvent(Long orderId, String orderNumber, Long userId, String status) {}
}
