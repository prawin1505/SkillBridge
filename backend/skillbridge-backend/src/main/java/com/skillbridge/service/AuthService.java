package com.skillbridge.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.skillbridge.dto.LoginRequest;
import com.skillbridge.dto.LoginResponse;
import com.skillbridge.dto.RegisterRequest;
import com.skillbridge.entity.PasswordResetToken;
import com.skillbridge.entity.Role;
import com.skillbridge.entity.User;
import com.skillbridge.exception.DuplicateResourceException;
import com.skillbridge.exception.InvalidCredentialsException;
import com.skillbridge.repository.PasswordResetTokenRepository;
import com.skillbridge.repository.RoleRepository;
import com.skillbridge.repository.UserRepository;
import com.skillbridge.security.JwtService;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailService emailService;

    public AuthService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            PasswordResetTokenRepository passwordResetTokenRepository,
            EmailService emailService) {

        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.emailService = emailService;
    }

    // =========================================================
    // LOGIN
    // =========================================================

    public LoginResponse login(LoginRequest request) {

        User user = userRepository
                .findByEmail(request.getEmail().trim())
                .orElseThrow(() ->
                        new InvalidCredentialsException(
                                "Invalid email or password"
                        )
                );

        // Check password
        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPasswordHash())) {

            throw new InvalidCredentialsException(
                    "Invalid email or password"
            );
        }

        // Check account status
        if (!user.isActive()) {
            throw new InvalidCredentialsException(
                    "Your account is inactive"
            );
        }

        // Generate JWT
        String token = jwtService.generateToken(
                user.getEmail(),
                user.getRole().getName()
        );

        return new LoginResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getRole().getName()
        );
    }

    // =========================================================
    // REGISTER
    // =========================================================

    public User register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail().trim())) {
    throw new DuplicateResourceException(
        "Email already registered"
    );
}

        Role userRole = roleRepository
                .findByName("USER")
                .orElseThrow(() ->
                        new RuntimeException(
                                "USER role not found"
                        )
                );

        User user = new User();

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail().trim());

        // Never store plain-text password
        user.setPasswordHash(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );

        user.setRole(userRole);
        user.setActive(true);
        user.setVerified(false);

        return userRepository.save(user);
    }

    // =========================================================
    // FORGOT PASSWORD
    // =========================================================

    public void forgotPassword(String email) {

        User user = userRepository
                .findByEmail(email.trim())
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        )
                );

        // Generate secure random token
        String token = UUID.randomUUID().toString();

        PasswordResetToken resetToken =
                new PasswordResetToken();

        resetToken.setToken(token);
        resetToken.setUser(user);

        // Token valid for 30 minutes
        resetToken.setExpiryTime(
                LocalDateTime.now().plusMinutes(30)
        );

        resetToken.setUsed(false);

        passwordResetTokenRepository.save(resetToken);

        // Send reset link
        emailService.sendPasswordResetEmail(
                user.getEmail(),
                token
        );
    }

    // =========================================================
    // RESET PASSWORD
    // =========================================================

    public void resetPassword(
            String token,
            String newPassword) {

        PasswordResetToken resetToken =
                passwordResetTokenRepository
                        .findByToken(token)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Invalid reset token"
                                )
                        );

        // Check if token was already used
        if (resetToken.isUsed()) {

            throw new RuntimeException(
                    "Reset token has already been used"
            );
        }

        // Check token expiry
        if (resetToken.getExpiryTime()
                .isBefore(LocalDateTime.now())) {

            throw new RuntimeException(
                    "Reset token has expired"
            );
        }

        User user = resetToken.getUser();

        // Encrypt new password
        user.setPasswordHash(
                passwordEncoder.encode(newPassword)
        );

        userRepository.save(user);

        // Make token unusable
        resetToken.setUsed(true);

        passwordResetTokenRepository.save(resetToken);
    }
}