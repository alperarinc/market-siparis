package com.market.config.audit;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.Instant;
import java.util.UUID;

/**
 * Enterprise-grade audit logging interceptor.
 * Her HTTP isteğini trace ID, kullanıcı bilgisi ve süre ile loglar.
 */
@Slf4j
@Component
public class AuditLogInterceptor implements HandlerInterceptor {

    private static final String ATTR_START_TIME = "audit.startTime";
    private static final String ATTR_TRACE_ID = "audit.traceId";

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) {
        // Trace ID oluştur
        String traceId = request.getHeader("X-Trace-Id");
        if (traceId == null || traceId.isEmpty()) {
            traceId = UUID.randomUUID().toString().substring(0, 8);
        }

        // MDC'ye ekle (log pattern'de kullanılır)
        MDC.put("traceId", traceId);
        MDC.put("userId", resolveUserId());

        request.setAttribute(ATTR_START_TIME, Instant.now().toEpochMilli());
        request.setAttribute(ATTR_TRACE_ID, traceId);

        // Response header'a trace ID ekle
        response.addHeader("X-Trace-Id", traceId);

        log.info("AUDIT_REQUEST | traceId={} | method={} | path={} | ip={} | user={}",
                traceId,
                request.getMethod(),
                request.getRequestURI(),
                extractClientIp(request),
                resolveUserId());

        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request,
                                HttpServletResponse response,
                                Object handler,
                                Exception ex) {
        long startTime = (long) request.getAttribute(ATTR_START_TIME);
        long duration = Instant.now().toEpochMilli() - startTime;
        String traceId = (String) request.getAttribute(ATTR_TRACE_ID);

        String logLevel = response.getStatus() >= 500 ? "ERROR" : "INFO";

        if (response.getStatus() >= 500) {
            log.error("AUDIT_RESPONSE | traceId={} | status={} | duration={}ms | path={} | error={}",
                    traceId,
                    response.getStatus(),
                    duration,
                    request.getRequestURI(),
                    ex != null ? ex.getMessage() : "N/A");
        } else if (response.getStatus() >= 400) {
            log.warn("AUDIT_RESPONSE | traceId={} | status={} | duration={}ms | path={}",
                    traceId,
                    response.getStatus(),
                    duration,
                    request.getRequestURI());
        } else {
            log.info("AUDIT_RESPONSE | traceId={} | status={} | duration={}ms | path={}",
                    traceId,
                    response.getStatus(),
                    duration,
                    request.getRequestURI());
        }

        // Yavaş istek uyarısı (2 saniyeden uzun)
        if (duration > 2000) {
            log.warn("SLOW_REQUEST | traceId={} | duration={}ms | path={}",
                    traceId, duration, request.getRequestURI());
        }

        // MDC temizle
        MDC.clear();
    }

    private String resolveUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            return auth.getName();
        }
        return "anonymous";
    }

    private String extractClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
