package com.skillbridge.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.skillbridge.entity.Notification;
import com.skillbridge.entity.User;
import com.skillbridge.repository.NotificationRepository;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    // Create notification
    public Notification createNotification(
            User user,
            String type,
            String message,
            Long referenceId
    ) {
        Notification notification = new Notification();

        notification.setUser(user);
        notification.setType(type);
        notification.setMessage(message);
        notification.setReferenceId(referenceId);
        notification.setRead(false);

        return notificationRepository.save(notification);
    }

    // Get all notifications
    public List<Notification> getNotifications(User user) {
        return notificationRepository
                .findByUserOrderByCreatedAtDesc(user);
    }

    // Get unread notifications
    public List<Notification> getUnreadNotifications(User user) {
        return notificationRepository
                .findByUserAndReadFalseOrderByCreatedAtDesc(user);
    }

    // Get unread count
    public long getUnreadCount(User user) {
        return notificationRepository
                .countByUserAndReadFalse(user);
    }

    // Mark one notification as read
    public Notification markAsRead(Long notificationId) {

        Notification notification =
                notificationRepository
                        .findById(notificationId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Notification not found"
                                )
                        );

        notification.setRead(true);

        return notificationRepository.save(notification);
    }

    // Mark all notifications as read
    public void markAllAsRead(User user) {

        List<Notification> notifications =
                notificationRepository
                        .findByUserAndReadFalseOrderByCreatedAtDesc(user);

        notifications.forEach(notification ->
                notification.setRead(true)
        );

        notificationRepository.saveAll(notifications);
    }
}