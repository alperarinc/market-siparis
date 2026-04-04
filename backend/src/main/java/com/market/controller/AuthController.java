package com.market.controller;

import com.market.dto.*;
import com.market.repository.UserRepository;
import com.market.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Kimlik Doğrulama", description = "Telefon + SMS OTP ile giriş/kayıt")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    @PostMapping("/send-otp")
    @Operation(summary = "SMS doğrulama kodu gönder")
    public ResponseEntity<ApiResponse<String>> sendOtp(@Valid @RequestBody AuthRequest request) {
        authService.sendOtp(request.phone());
        return ResponseEntity.ok(ApiResponse.success("Doğrulama kodu gönderildi", null));
    }

    @PostMapping("/verify-otp")
    @Operation(summary = "OTP doğrula ve giriş yap")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyOtp(
            @Valid @RequestBody OtpVerifyRequest request,
            HttpServletResponse response) {

        AuthResponse authResponse = authService.verifyOtpAndLogin(request.phone(), request.otp());

        // Access token'ı HttpOnly cookie olarak ayarla
        ResponseCookie accessCookie = ResponseCookie.from("access_token", authResponse.accessToken())
                .httpOnly(true)
                .secure(false) // Prod'da true olacak
                .path("/")
                .maxAge(Duration.ofMinutes(15))
                .sameSite("Lax")
                .build();

        ResponseCookie refreshCookie = ResponseCookie.from("refresh_token", authResponse.refreshToken())
                .httpOnly(true)
                .secure(false)
                .path("/api/auth/refresh")
                .maxAge(Duration.ofDays(7))
                .sameSite("Lax")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());
        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());

        return ResponseEntity.ok(ApiResponse.success("Giriş başarılı", authResponse));
    }

    @PostMapping("/register")
    @Operation(summary = "Yeni kullanıcı kaydı (OTP doğrulaması sonrası)")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletResponse response) {

        AuthResponse authResponse = authService.register(request);

        ResponseCookie accessCookie = ResponseCookie.from("access_token", authResponse.accessToken())
                .httpOnly(true).secure(false).path("/").maxAge(Duration.ofMinutes(15)).sameSite("Lax").build();
        ResponseCookie refreshCookie = ResponseCookie.from("refresh_token", authResponse.refreshToken())
                .httpOnly(true).secure(false).path("/api/auth/refresh").maxAge(Duration.ofDays(7)).sameSite("Lax").build();

        response.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());
        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());

        return ResponseEntity.ok(ApiResponse.success("Kayıt başarılı", authResponse));
    }

    @GetMapping("/me")
    @Operation(summary = "Mevcut kullanıcı bilgisini getir")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUser(Authentication auth) {
        if (auth == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Giriş yapılmamış"));
        }
        Long userId = (Long) auth.getPrincipal();
        return userRepository.findById(userId)
                .map(user -> ResponseEntity.ok(ApiResponse.success(UserDto.from(user))))
                .orElse(ResponseEntity.status(401).body(ApiResponse.error("Kullanıcı bulunamadı")));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Token yenile")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(
            @CookieValue(name = "refresh_token", required = false) String refreshToken,
            HttpServletResponse response) {
        if (refreshToken == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Refresh token bulunamadı"));
        }
        AuthResponse authResponse = authService.refreshToken(refreshToken);

        // Yeni cookie'ler set et
        ResponseCookie accessCookie = ResponseCookie.from("access_token", authResponse.accessToken())
                .httpOnly(true).secure(false).path("/").maxAge(Duration.ofMinutes(15)).sameSite("Lax").build();
        ResponseCookie refreshCookie = ResponseCookie.from("refresh_token", authResponse.refreshToken())
                .httpOnly(true).secure(false).path("/api/auth/refresh").maxAge(Duration.ofDays(7)).sameSite("Lax").build();

        response.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());
        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());

        return ResponseEntity.ok(ApiResponse.success(authResponse));
    }

    @PostMapping("/logout")
    @Operation(summary = "Çıkış yap")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletResponse response) {
        ResponseCookie clearAccess = ResponseCookie.from("access_token", "")
                .httpOnly(true).path("/").maxAge(0).build();
        ResponseCookie clearRefresh = ResponseCookie.from("refresh_token", "")
                .httpOnly(true).path("/api/auth/refresh").maxAge(0).build();

        response.addHeader(HttpHeaders.SET_COOKIE, clearAccess.toString());
        response.addHeader(HttpHeaders.SET_COOKIE, clearRefresh.toString());

        return ResponseEntity.ok(ApiResponse.success("Çıkış yapıldı", null));
    }
}
