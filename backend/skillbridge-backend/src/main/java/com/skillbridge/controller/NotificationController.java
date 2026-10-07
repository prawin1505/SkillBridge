package com.skillbridge.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.skillbridge.entity.Notification;
import com.skillbridge.entity.User;
import com.skillbridge.repository.UserRepository;
import com.skillbridge.service.NotificationService;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public NotificationController(
            NotificationService notificationService,
            UserRepository userRepository
    ) {
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

@GetMapping
public ResponseEntity<List<Notification>> getNotifications(Authentication authentication) {

    System.out.println("=================================");
    System.out.println("NOTIFICATION CONTROLLER");
    System.out.println("AUTH NAME: " + authentication.getName());
    System.out.println("PRINCIPAL: " + authentication.getPrincipal());
    System.out.println("=================================");

    User user;

    if (authentication.getPrincipal() instanceof User) {
        user = (User) authentication.getPrincipal();
    } else {
        String email = authentication.getName();

        user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found for email: " + email));
    }

    return ResponseEntity.ok(notificationService.getNotifications(user));
}

   @GetMapping("/unread-count")
public ResponseEntity<Long> getUnreadCount(Authentication authentication) {

    System.out.println("=================================");
    System.out.println("UNREAD COUNT CONTROLLER");
    System.out.println("AUTH NAME: " + authentication.getName());
    System.out.println("PRINCIPAL: " + authentication.getPrincipal());
    System.out.println("=================================");

    User user;

    if (authentication.getPrincipal() instanceof User) {
        user = (User) authentication.getPrincipal();
    } else {
        String email = authentication.getName();

        user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found for email: " + email));
    }

    return ResponseEntity.ok(notificationService.getUnreadCount(user));
}

@PutMapping("/{id}/read")
public ResponseEntity<Notification> markAsRead(
        @PathVariable Long id,
        Authentication authentication) {

    System.out.println("=================================");
    System.out.println("MARK NOTIFICATION AS READ");
    System.out.println("NOTIFICATION ID: " + id);
    System.out.println("AUTH NAME: " + authentication.getName());
    System.out.println("PRINCIPAL: " + authentication.getPrincipal());
    System.out.println("=================================");

    User user;

    if (authentication.getPrincipal() instanceof User) {
        user = (User) authentication.getPrincipal();
    } else {
        String email = authentication.getName();

        user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found for email: " + email));
    }

    Notification notification = notificationService.markAsRead(id);

    // Security check: notification must belong to logged-in user
    if (!notification.getUser().getId().equals(user.getId())) {
        return ResponseEntity.status(403).build();
    }

    return ResponseEntity.ok(notification);
}

    @PutMapping("/read-all")
public ResponseEntity<String> markAllAsRead(Authentication authentication) {

    System.out.println("=================================");
    System.out.println("MARK ALL AS READ CONTROLLER");
    System.out.println("AUTH NAME: " + authentication.getName());
    System.out.println("PRINCIPAL: " + authentication.getPrincipal());
    System.out.println("=================================");

    User user;

    if (authentication.getPrincipal() instanceof User) {
        user = (User) authentication.getPrincipal();
    } else {
        String email = authentication.getName();

        user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found for email: " + email));
    }

    notificationService.markAllAsRead(user);

    return ResponseEntity.ok("All notifications marked as read");
}
}