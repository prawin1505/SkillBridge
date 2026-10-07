package com.skillbridge.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.skillbridge.dto.ForgotPasswordRequest;
import com.skillbridge.dto.LoginRequest;
import com.skillbridge.dto.LoginResponse;
import com.skillbridge.dto.RegisterRequest;
import com.skillbridge.dto.ResetPasswordRequest;
import com.skillbridge.entity.User;
import com.skillbridge.service.AuthService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // =========================
    // REGISTER
    // =========================

    @PostMapping("/register")
    public ResponseEntity<String> register(
            @Valid @RequestBody RegisterRequest request) {

        User user = authService.register(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body("User registered successfully");
    }

    // =========================
    // LOGIN
    // =========================

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request) {

        return ResponseEntity.ok(
                authService.login(request)
        );
    }

    // =========================
    // FORGOT PASSWORD
    // =========================

    @PostMapping("/forgot-password")
public ResponseEntity<String> forgotPassword(
        @Valid @RequestBody ForgotPasswordRequest request) {

    authService.forgotPassword(
            request.getEmail()
    );

    return ResponseEntity.ok(
            "Password reset link has been sent to your email"
    );
}

    // =========================
    // RESET PASSWORD
    // =========================

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {

        authService.resetPassword(
                request.getToken(),
                request.getNewPassword()
        );

        return ResponseEntity.ok(
                "Password reset successfully"
        );
    }
}