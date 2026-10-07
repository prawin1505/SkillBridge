package com.skillbridge.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.skillbridge.entity.Notification;
import com.skillbridge.entity.User;

public interface NotificationRepository
        extends JpaRepository<Notification, Long> {

    List<Notification> findByUserOrderByCreatedAtDesc(User user);

    List<Notification> findByUserAndReadFalseOrderByCreatedAtDesc(User user);

    long countByUserAndReadFalse(User user);
}