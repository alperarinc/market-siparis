package com.market.service;

import com.market.domain.CartItem;
import com.market.domain.Product;
import com.market.domain.User;
import com.market.dto.CartItemRequest;
import com.market.exception.BusinessException;
import com.market.repository.CartItemRepository;
import com.market.repository.ProductRepository;
import com.market.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public Map<String, Object> getCart(Long userId) {
        Map<String, Object> cart = new HashMap<>();
        cartItemRepository.findByUserId(userId)
                .forEach(item -> cart.put(item.getProduct().getId().toString(), item.getQuantity().toPlainString()));
        return cart;
    }

    @Transactional
    public void addItem(Long userId, CartItemRequest request) {
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> BusinessException.notFound("Ürün"));
        if (!product.getActive() || !product.isInStock()) {
            throw BusinessException.unprocessable("Ürün stokta yok: " + product.getName());
        }

        cartItemRepository.findByUserIdAndProductId(userId, request.productId())
                .ifPresentOrElse(
                        item -> {
                            item.setQuantity(item.getQuantity().add(request.quantity()));
                            cartItemRepository.save(item);
                        },
                        () -> {
                            User user = userRepository.getReferenceById(userId);
                            CartItem item = CartItem.builder()
                                    .user(user)
                                    .product(product)
                                    .quantity(request.quantity())
                                    .build();
                            cartItemRepository.save(item);
                        }
                );
    }

    @Transactional
    public void updateItem(Long userId, Long productId, BigDecimal quantity) {
        if (quantity.compareTo(BigDecimal.ZERO) <= 0) {
            cartItemRepository.deleteByUserIdAndProductId(userId, productId);
        } else {
            cartItemRepository.findByUserIdAndProductId(userId, productId)
                    .ifPresent(item -> {
                        item.setQuantity(quantity);
                        cartItemRepository.save(item);
                    });
        }
    }

    @Transactional
    public void removeItem(Long userId, Long productId) {
        cartItemRepository.deleteByUserIdAndProductId(userId, productId);
    }

    @Transactional
    public void clearCart(Long userId) {
        cartItemRepository.deleteByUserId(userId);
    }
}
