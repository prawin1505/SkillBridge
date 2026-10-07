package com.skillbridge.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.skillbridge.dto.ConnectionResponse;
import com.skillbridge.dto.ConnectionUserResponse;
import com.skillbridge.dto.CreateConnectionRequest;
import com.skillbridge.entity.Connection;
import com.skillbridge.entity.ConnectionStatus;
import com.skillbridge.entity.User;
import com.skillbridge.exception.BadRequestException;
import com.skillbridge.exception.ResourceNotFoundException;
import com.skillbridge.repository.ConnectionRepository;
import com.skillbridge.repository.UserRepository;

@Service
public class ConnectionService {

    private final ConnectionRepository connectionRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public ConnectionService(
            ConnectionRepository connectionRepository,
            UserRepository userRepository,
            NotificationService notificationService) {

        this.connectionRepository = connectionRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    // ================================
    // SEND CONNECTION REQUEST
    // ================================

    public ConnectionResponse sendRequest(
            User sender,
            CreateConnectionRequest request) {

        Long receiverId = request.getReceiverId();

        // 1. Prevent self connection
        if (sender.getId().equals(receiverId)) {
            throw new BadRequestException(
                    "You cannot send a connection request to yourself"
            );
        }

        // 2. Find receiver
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Receiver user not found"
                        )
                );

        // 3. Check existing request
        var existingRequest =
                connectionRepository.findBySenderIdAndReceiverId(
                        sender.getId(),
                        receiverId
                );

        if (existingRequest.isPresent()) {
            throw new BadRequestException(
                    "Connection request already exists"
            );
        }

        // 4. Check reverse request
        var reverseRequest =
                connectionRepository.findBySenderIdAndReceiverId(
                        receiverId,
                        sender.getId()
                );

        if (reverseRequest.isPresent()) {

            Connection reverse = reverseRequest.get();

            if (reverse.getStatus() == ConnectionStatus.PENDING) {
                throw new BadRequestException(
                        "This user has already sent you a connection request"
                );
            }

            if (reverse.getStatus() == ConnectionStatus.ACCEPTED) {
                throw new BadRequestException(
                        "You are already connected with this user"
                );
            }
        }

        // 5. Create connection
        Connection connection = new Connection();

        connection.setSender(sender);
        connection.setReceiver(receiver);
        connection.setStatus(ConnectionStatus.PENDING);
        connection.setCreatedAt(LocalDateTime.now());
        connection.setUpdatedAt(LocalDateTime.now());

        // 6. Save connection
        Connection saved =
                connectionRepository.save(connection);

        // 7. Create notification for receiver
        notificationService.createNotification(
                receiver,
                "CONNECTION_REQUEST",
                sender.getFirstName() + " "
                        + sender.getLastName()
                        + " sent you a connection request",
                saved.getId()
        );

        return convertToResponse(saved);
    }

    // ================================
    // GET SENT REQUESTS
    // ================================

    public List<ConnectionResponse> getSentRequests(
            User user) {

        return connectionRepository
                .findBySenderId(user.getId())
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    // ================================
    // GET RECEIVED REQUESTS
    // ================================

    public List<ConnectionResponse> getReceivedRequests(
            User user) {

        return connectionRepository
                .findByReceiverId(user.getId())
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    // ================================
    // ACCEPT CONNECTION REQUEST
    // ================================

    public ConnectionResponse acceptRequest(
            Long connectionId,
            User currentUser) {

        Connection connection =
                connectionRepository.findById(connectionId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Connection request not found"
                                )
                        );

        // Only receiver can accept
        if (!connection.getReceiver().getId()
                .equals(currentUser.getId())) {

            throw new BadRequestException(
                    "You can only accept requests sent to you"
            );
        }

        // Check status
        if (connection.getStatus()
                != ConnectionStatus.PENDING) {

            throw new BadRequestException(
                    "This connection request is not pending"
            );
        }

        // Change status
        connection.setStatus(
                ConnectionStatus.ACCEPTED
        );

        connection.setUpdatedAt(
                LocalDateTime.now()
        );

        // Save
        Connection saved =
                connectionRepository.save(connection);

        // Create notification for original sender
        notificationService.createNotification(
                connection.getSender(),
                "CONNECTION_ACCEPTED",
                currentUser.getFirstName() + " "
                        + currentUser.getLastName()
                        + " accepted your connection request",
                saved.getId()
        );

        return convertToResponse(saved);
    }

    // ================================
    // REJECT CONNECTION REQUEST
    // ================================

    public ConnectionResponse rejectRequest(
            Long connectionId,
            User currentUser) {

        Connection connection =
                connectionRepository.findById(connectionId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Connection request not found"
                                )
                        );

        // Only receiver can reject
        if (!connection.getReceiver().getId()
                .equals(currentUser.getId())) {

            throw new BadRequestException(
                    "You can only reject requests sent to you"
            );
        }

        // Check status
        if (connection.getStatus()
                != ConnectionStatus.PENDING) {

            throw new BadRequestException(
                    "This connection request is not pending"
            );
        }

        // Change status
        connection.setStatus(
                ConnectionStatus.REJECTED
        );

        connection.setUpdatedAt(
                LocalDateTime.now()
        );

        // Save
        Connection saved =
                connectionRepository.save(connection);

        return convertToResponse(saved);
    }

    // ================================
    // GET MY ACCEPTED CONNECTIONS
    // ================================

    public List<ConnectionUserResponse> getMyConnections(
            User user) {

        List<Connection> sent =
                connectionRepository.findBySenderId(user.getId());

        List<Connection> received =
                connectionRepository.findByReceiverId(user.getId());

        List<Connection> allConnections =
                new java.util.ArrayList<>();

        allConnections.addAll(sent);
        allConnections.addAll(received);

        return allConnections.stream()
                .filter(c ->
                        c.getStatus()
                                == ConnectionStatus.ACCEPTED)
                .map(c -> {

                    User otherUser;

                    if (c.getSender().getId()
                            .equals(user.getId())) {

                        otherUser = c.getReceiver();

                    } else {

                        otherUser = c.getSender();
                    }

                    return new ConnectionUserResponse(
                            c.getId(),
                            otherUser.getId(),
                            otherUser.getFirstName(),
                            otherUser.getLastName(),
                            otherUser.getEmail(),
                            c.getStatus()
                    );
                })
                .toList();
    }

    // ================================
    // CONVERT ENTITY → DTO
    // ================================

    private ConnectionResponse convertToResponse(
            Connection connection) {

        User sender = connection.getSender();
        User receiver = connection.getReceiver();

        return new ConnectionResponse(
                connection.getId(),

                sender.getId(),
                sender.getFirstName()
                        + " "
                        + sender.getLastName(),

                receiver.getId(),
                receiver.getFirstName()
                        + " "
                        + receiver.getLastName(),

                connection.getStatus(),

                connection.getCreatedAt()
        );
    }
}