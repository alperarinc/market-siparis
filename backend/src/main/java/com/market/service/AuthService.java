package com.market.service;

import com.market.domain.Address;
import com.market.domain.User;
import com.market.domain.UserRole;
import com.market.dto.AuthResponse;
import com.market.dto.RegisterRequest;
import com.market.dto.UserDto;
import com.market.exception.BusinessException;
import com.market.repository.AddressRepository;
import com.market.repository.UserRepository;
import com.market.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final OtpService otpService;
    private final JwtTokenProvider tokenProvider;

    public void sendOtp(String phone) {
        otpService.generateAndSendOtp(normalizePhone(phone));
    }

    @Transactional
    public AuthResponse verifyOtpAndLogin(String phone, String otp) {
        phone = normalizePhone(phone);
        boolean valid = otpService.verifyOtp(phone, otp);
        if (!valid) {
            throw BusinessException.unauthorized("Geçersiz doğrulama kodu");
        }

        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> BusinessException.unauthorized("Bu numara ile kayıtlı hesap bulunamadı. Lütfen kayıt olun."));

        if (!user.getActive()) {
            throw BusinessException.unauthorized("Hesabınız devre dışı bırakılmış");
        }

        return generateTokens(user);
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String phone = normalizePhone(request.phone());
        boolean valid = otpService.verifyOtp(phone, request.otp());
        if (!valid) {
            throw BusinessException.unauthorized("Geçersiz doğrulama kodu");
        }

        if (userRepository.findByPhone(phone).isPresent()) {
            throw BusinessException.conflict("Bu telefon numarası zaten kayıtlı");
        }

        User user = User.builder()
                .phone(phone)
                .fullName(request.fullName())
                .role(UserRole.CUSTOMER)
                .active(true)
                .build();
        user = userRepository.save(user);

        Address address = Address.builder()
                .user(user)
                .title("Ev")
                .fullAddress(request.fullAddress())
                .district(request.district())
                .city("Tokat / Merkez")
                .isDefault(true)
                .build();
        addressRepository.save(address);

        return generateTokens(user);
    }

    public AuthResponse refreshToken(String refreshToken) {
        if (!tokenProvider.validateToken(refreshToken)) {
            throw BusinessException.unauthorized("Geçersiz refresh token");
        }

        Long userId = tokenProvider.getUserIdFromToken(refreshToken);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> BusinessException.notFound("Kullanıcı"));

        return generateTokens(user);
    }

    private AuthResponse generateTokens(User user) {
        String accessToken = tokenProvider.generateAccessToken(user.getId(), user.getPhone(), user.getRole().name());
        String refreshToken = tokenProvider.generateRefreshToken(user.getId(), user.getPhone(), user.getRole().name());
        return new AuthResponse(accessToken, refreshToken, UserDto.from(user));
    }

    /**
     * Telefon numarasini 0XXXXXXXXXX formatina normalize eder.
     * "5445583016" -> "05445583016"
     * "+905445583016" -> "05445583016"
     * "905445583016" -> "05445583016"
     * "05445583016" -> "05445583016"
     */
    private String normalizePhone(String phone) {
        if (phone == null) return phone;
        String digits = phone.replaceAll("\\D", "");
        if (digits.startsWith("90") && digits.length() == 12) {
            return "0" + digits.substring(2);
        }
        if (digits.startsWith("0") && digits.length() == 11) {
            return digits;
        }
        if (digits.length() == 10 && digits.startsWith("5")) {
            return "0" + digits;
        }
        return digits;
    }
}
