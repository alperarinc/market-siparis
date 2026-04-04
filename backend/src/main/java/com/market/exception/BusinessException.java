package com.market.exception;

import org.springframework.http.HttpStatus;

public class BusinessException extends RuntimeException {

    private final HttpStatus status;

    public BusinessException(String message) {
        super(message);
        this.status = HttpStatus.BAD_REQUEST;
    }

    public BusinessException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }

    // 404
    public static BusinessException notFound(String entity) {
        return new BusinessException(entity + " bulunamadı", HttpStatus.NOT_FOUND);
    }

    // 401
    public static BusinessException unauthorized(String message) {
        return new BusinessException(message, HttpStatus.UNAUTHORIZED);
    }

    // 403
    public static BusinessException forbidden(String message) {
        return new BusinessException(message, HttpStatus.FORBIDDEN);
    }

    // 409
    public static BusinessException conflict(String message) {
        return new BusinessException(message, HttpStatus.CONFLICT);
    }

    // 422
    public static BusinessException unprocessable(String message) {
        return new BusinessException(message, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    // 429
    public static BusinessException tooManyRequests(String message) {
        return new BusinessException(message, HttpStatus.TOO_MANY_REQUESTS);
    }

    // 503
    public static BusinessException serviceUnavailable(String message) {
        return new BusinessException(message, HttpStatus.SERVICE_UNAVAILABLE);
    }
}
