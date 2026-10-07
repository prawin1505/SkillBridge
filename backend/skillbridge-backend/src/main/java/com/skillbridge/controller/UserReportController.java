package com.skillbridge.controller;

import com.skillbridge.dto.UserReportRequest;
import com.skillbridge.dto.UserReportResponse;
import com.skillbridge.entity.User;
import com.skillbridge.repository.UserRepository;
import com.skillbridge.service.UserReportService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin
public class UserReportController {

    private final UserReportService userReportService;
    private final UserRepository userRepository;

    public UserReportController(
            UserReportService userReportService,
            UserRepository userRepository) {

        this.userReportService = userReportService;
        this.userRepository = userRepository;
    }

    // =========================================================
    // CREATE REPORT
    // =========================================================

    @PostMapping
    public ResponseEntity<UserReportResponse> createReport(
            @Valid @RequestBody UserReportRequest request,
            Authentication authentication) {

        User reporter = getAuthenticatedUser(authentication);

        return ResponseEntity.ok(
                userReportService.createReport(
                        reporter,
                        request
                )
        );
    }

    // =========================================================
    // GET MY REPORTS
    // =========================================================

    @GetMapping("/my")
    public ResponseEntity<List<UserReportResponse>> getMyReports(
            Authentication authentication) {

        User reporter = getAuthenticatedUser(authentication);

        return ResponseEntity.ok(
                userReportService.getMyReports(reporter)
        );
    }

    // =========================================================
    // ADMIN - GET ALL REPORTS
    // =========================================================

    @GetMapping("/admin")
    public ResponseEntity<List<UserReportResponse>> getAllReports() {

        return ResponseEntity.ok(
                userReportService.getAllReports()
        );
    }

    // =========================================================
    // ADMIN - RESOLVE REPORT
    // =========================================================

    @PutMapping("/admin/{id}/resolve")
    public ResponseEntity<UserReportResponse> resolveReport(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                userReportService.resolveReport(id)
        );
    }

    // =========================================================
    // ADMIN - DISMISS REPORT
    // =========================================================

    @PutMapping("/admin/{id}/dismiss")
    public ResponseEntity<UserReportResponse> dismissReport(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                userReportService.dismissReport(id)
        );
    }

    // =========================================================
    // GET AUTHENTICATED USER
    // =========================================================

    private User getAuthenticatedUser(
            Authentication authentication) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new RuntimeException(
                    "User is not authenticated"
            );
        }

        // Your JWT filter stores User as the principal
        if (authentication.getPrincipal() instanceof User) {

            return (User) authentication.getPrincipal();
        }

        // Fallback if principal is a String/email
        String email = authentication.getName();

        return userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Authenticated user not found: "
                                        + email
                        ));
    }
}