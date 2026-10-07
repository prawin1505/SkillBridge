package com.skillbridge.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.skillbridge.entity.Connection;
import com.skillbridge.entity.ConnectionStatus;

public interface ConnectionRepository
        extends JpaRepository<Connection, Long> {

    Optional<Connection> findBySenderIdAndReceiverId(
            Long senderId,
            Long receiverId
    );

    List<Connection> findBySenderId(Long senderId);

    List<Connection> findByReceiverId(Long receiverId);

    List<Connection> findByReceiverIdAndStatus(
            Long receiverId,
            ConnectionStatus status
    );
    List<Connection> findBySenderIdAndStatus(
        Long senderId,
        ConnectionStatus status
);

}