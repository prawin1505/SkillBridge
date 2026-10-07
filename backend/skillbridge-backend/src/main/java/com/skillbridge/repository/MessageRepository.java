package com.skillbridge.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.skillbridge.entity.Message;

public interface MessageRepository
        extends JpaRepository<Message, Long> {

    // =========================================================
    // GET ALL MESSAGES
    // =========================================================

    List<Message> findByConnectionIdOrderBySentAtAsc(
            Long connectionId
    );

    // =========================================================
    // GET ALL UNREAD MESSAGES FOR USER
    // =========================================================

    List<Message> findByReceiverIdAndReadFalse(
            Long receiverId
    );

    // =========================================================
    // GET UNREAD MESSAGES FOR CONNECTION
    // =========================================================

    List<Message> findByConnectionIdAndReceiverIdAndReadFalse(
            Long connectionId,
            Long receiverId
    );

    // =========================================================
    // MARK MESSAGES AS READ
    // =========================================================

    @Transactional
    @Modifying(
        clearAutomatically = true,
        flushAutomatically = true
    )
    @Query("""
        UPDATE Message m
        SET m.read = true
        WHERE m.connection.id = :connectionId
        AND m.receiver.id = :receiverId
        AND m.read = false
    """)
    int markMessagesAsRead(
            @Param("connectionId") Long connectionId,
            @Param("receiverId") Long receiverId
    );
}