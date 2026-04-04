package com.market.config.resilience;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * IP bazlı rate limiting filtresi.
 * Bucket4j kullanarak her IP adresi için ayrı token bucket oluşturur.
 */
@Slf4j
@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private final Map<String, Bucket> bucketCache = new ConcurrentHashMap<>();

    // Genel API limiti: dakikada 100 istek
    private static final int API_CAPACITY = 100;
    private static final int API_REFILL_TOKENS = 100;
    private static final Duration API_REFILL_DURATION = Duration.ofMinutes(1);

    // Auth endpoint limiti: dakikada 10 istek (brute-force koruması)
    private static final int AUTH_CAPACITY = 10;
    private static final int AUTH_REFILL_TOKENS = 10;
    private static final Duration AUTH_REFILL_DURATION = Duration.ofMinutes(1);

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String clientIp = extractClientIp(request);
        String path = request.getRequestURI();

        Bucket bucket = resolveBucket(clientIp, path);

        if (bucket.tryConsume(1)) {
            // Kalan token bilgisini header'a ekle
            response.addHeader("X-Rate-Limit-Remaining",
                    String.valueOf(bucket.getAvailableTokens()));
            filterChain.doFilter(request, response);
        } else {
            log.warn("Rate limit aşıldı - IP: {}, Path: {}", clientIp, path);
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.getWriter().write(
                    "{\"error\":\"Too Many Requests\",\"message\":\"İstek limiti aşıldı. Lütfen daha sonra tekrar deneyin.\"}"
            );
        }
    }

    private Bucket resolveBucket(String clientIp, String path) {
        String key = isAuthEndpoint(path) ? "auth:" + clientIp : "api:" + clientIp;
        return bucketCache.computeIfAbsent(key, k -> createBucket(path));
    }

    private Bucket createBucket(String path) {
        if (isAuthEndpoint(path)) {
            return Bucket.builder()
                    .addLimit(Bandwidth.classic(AUTH_CAPACITY,
                            Refill.greedy(AUTH_REFILL_TOKENS, AUTH_REFILL_DURATION)))
                    .build();
        }
        return Bucket.builder()
                .addLimit(Bandwidth.classic(API_CAPACITY,
                        Refill.greedy(API_REFILL_TOKENS, API_REFILL_DURATION)))
                .build();
    }

    private boolean isAuthEndpoint(String path) {
        return path.contains("/auth/");
    }

    private String extractClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        return request.getRemoteAddr();
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        // Actuator ve Swagger endpoint'leri rate limit'ten muaf
        return path.startsWith("/actuator") || path.startsWith("/api/swagger-ui")
                || path.startsWith("/api/api-docs");
    }
}
