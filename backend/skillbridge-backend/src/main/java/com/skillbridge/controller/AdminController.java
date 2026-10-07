package com.skillbridge.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.skillbridge.dto.AdminAnalyticsResponse;
import com.skillbridge.entity.User;
import com.skillbridge.repository.ConnectionRepository;
import com.skillbridge.repository.UserReportRepository;
import com.skillbridge.repository.UserRepository;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final UserReportRepository userReportRepository;
    private final ConnectionRepository connectionRepository;

    public AdminController(
            UserRepository userRepository,
            UserReportRepository userReportRepository,
            ConnectionRepository connectionRepository) {

        this.userRepository = userRepository;
        this.userReportRepository = userReportRepository;
        this.connectionRepository = connectionRepository;
    }

    // ==========================================
    // GET ALL USERS
    // ==========================================

    @GetMapping("/users")
    public ResponseEntity<List<AdminUserResponse>> getAllUsers() {

        List<User> users = userRepository.findAll();

        List<AdminUserResponse> response =
                users.stream()
                        .map(user ->
                                new AdminUserResponse(
                                        user.getId(),
                                        user.getFirstName(),
                                        user.getLastName(),
                                        user.getEmail(),
                                        user.isActive(),
                                        user.isVerified(),
                                        user.getRole() != null
                                                ? user.getRole().getName()
                                                : null
                                )
                        )
                        .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    // ==========================================
    // ADMIN STATISTICS
    // ==========================================

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getStatistics() {

        List<User> users = userRepository.findAll();

        long totalUsers = users.size();

        long activeUsers = users.stream()
                .filter(User::isActive)
                .count();

        long inactiveUsers = users.stream()
                .filter(user -> !user.isActive())
                .count();

        long verifiedUsers = users.stream()
                .filter(User::isVerified)
                .count();

        long adminUsers = users.stream()
                .filter(user ->
                        user.getRole() != null &&
                        "ADMIN".equalsIgnoreCase(
                                user.getRole().getName()
                        )
                )
                .count();

        long normalUsers = users.stream()
                .filter(user ->
                        user.getRole() != null &&
                        "USER".equalsIgnoreCase(
                                user.getRole().getName()
                        )
                )
                .count();

        Map<String, Long> stats = new HashMap<>();

        stats.put("totalUsers", totalUsers);
        stats.put("activeUsers", activeUsers);
        stats.put("inactiveUsers", inactiveUsers);
        stats.put("verifiedUsers", verifiedUsers);
        stats.put("adminUsers", adminUsers);
        stats.put("normalUsers", normalUsers);

        return ResponseEntity.ok(stats);
    }

    // ==========================================
    // ACTIVATE / DEACTIVATE USER
    // ==========================================

    @PutMapping("/users/{id}/status")
    public ResponseEntity<?> updateUserStatus(
            @PathVariable Long id,
            @RequestParam boolean active) {

        User user = userRepository.findById(id)
                .orElse(null);

        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        user.setActive(active);

        User savedUser = userRepository.save(user);

        return ResponseEntity.ok(
                new AdminUserResponse(
                        savedUser.getId(),
                        savedUser.getFirstName(),
                        savedUser.getLastName(),
                        savedUser.getEmail(),
                        savedUser.isActive(),
                        savedUser.isVerified(),
                        savedUser.getRole() != null
                                ? savedUser.getRole().getName()
                                : null
                )
        );
    }

    // ==========================================
    // DELETE USER
    // ==========================================

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {

        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        userRepository.deleteById(id);

        return ResponseEntity.ok("User deleted successfully");
    }

    // ==========================================
    // ADMIN ANALYTICS
    // ==========================================

    @GetMapping("/analytics")
    public ResponseEntity<AdminAnalyticsResponse> getAnalytics() {

        List<User> users = userRepository.findAll();

        long totalUsers = users.size();

        long activeUsers = users.stream()
                .filter(User::isActive)
                .count();

        long inactiveUsers = users.stream()
                .filter(user -> !user.isActive())
                .count();

        long adminUsers = users.stream()
                .filter(user ->
                        user.getRole() != null &&
                        "ADMIN".equalsIgnoreCase(
                                user.getRole().getName()
                        )
                )
                .count();

        long normalUsers = users.stream()
                .filter(user ->
                        user.getRole() != null &&
                        "USER".equalsIgnoreCase(
                                user.getRole().getName()
                        )
                )
                .count();

        // IMPORTANT:
        // count() belongs to the repository instance.
        long totalConnections = connectionRepository.count();

        long totalReports = userReportRepository.count();

        long pendingReports =
                userReportRepository.countByStatus("PENDING");

        long resolvedReports =
                userReportRepository.countByStatus("RESOLVED");

        long dismissedReports =
                userReportRepository.countByStatus("DISMISSED");

        AdminAnalyticsResponse response =
                new AdminAnalyticsResponse(
                        totalUsers,
                        activeUsers,
                        inactiveUsers,
                        adminUsers,
                        normalUsers,
                        totalConnections,
                        totalReports,
                        pendingReports,
                        resolvedReports,
                        dismissedReports
                );

        return ResponseEntity.ok(response);
    }

    // ==========================================
    // ADMIN USER RESPONSE
    // ==========================================

    public static class AdminUserResponse {

        private Long id;
        private String firstName;
        private String lastName;
        private String email;
        private boolean active;
        private boolean verified;
        private String role;

        public AdminUserResponse(
                Long id,
                String firstName,
                String lastName,
                String email,
                boolean active,
                boolean verified,
                String role) {

            this.id = id;
            this.firstName = firstName;
            this.lastName = lastName;
            this.email = email;
            this.active = active;
            this.verified = verified;
            this.role = role;
        }

        public Long getId() {
            return id;
        }

        public String getFirstName() {
            return firstName;
        }

        public String getLastName() {
            return lastName;
        }

        public String getEmail() {
            return email;
        }

        public boolean isActive() {
            return active;
        }

        public boolean isVerified() {
            return verified;
        }

        public String getRole() {
            return role;
        }
    }
}