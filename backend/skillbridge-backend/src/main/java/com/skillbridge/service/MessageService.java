package com.skillbridge.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.skillbridge.dto.MessageResponse;
import com.skillbridge.dto.SendMessageRequest;
import com.skillbridge.entity.Connection;
import com.skillbridge.entity.ConnectionStatus;
import com.skillbridge.entity.Message;
import com.skillbridge.entity.User;
import com.skillbridge.exception.BadRequestException;
import com.skillbridge.exception.ResourceNotFoundException;
import com.skillbridge.repository.ConnectionRepository;
import com.skillbridge.repository.MessageRepository;

@Service
public class MessageService {

    private final MessageRepository messageRepository;
    private final ConnectionRepository connectionRepository;

    public MessageService(
            MessageRepository messageRepository,
            ConnectionRepository connectionRepository) {

        this.messageRepository = messageRepository;
        this.connectionRepository = connectionRepository;
    }

    // =========================================================
    // SEND MESSAGE
    // =========================================================

    public MessageResponse sendMessage(
            Long connectionId,
            SendMessageRequest request,
            User currentUser) {

        Connection connection =
                connectionRepository.findById(connectionId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Connection not found"
                                )
                        );

        boolean isSender =
                connection.getSender().getId()
                        .equals(currentUser.getId());

        boolean isReceiver =
                connection.getReceiver().getId()
                        .equals(currentUser.getId());

        if (!isSender && !isReceiver) {

            throw new BadRequestException(
                    "You are not part of this connection"
            );
        }

        if (connection.getStatus()
                != ConnectionStatus.ACCEPTED) {

            throw new BadRequestException(
                    "Chat is available only for accepted connections"
            );
        }

        User receiver;

        if (isSender) {
            receiver = connection.getReceiver();
        } else {
            receiver = connection.getSender();
        }

        Message message = new Message();

        message.setConnection(connection);
        message.setSender(currentUser);
        message.setReceiver(receiver);
        message.setContent(request.getContent());
        message.setSentAt(LocalDateTime.now());
        message.setRead(false);

        Message saved =
                messageRepository.save(message);

        return convertToResponse(saved);
    }


    // =========================================================
    // GET MESSAGES
    // =========================================================

    public List<MessageResponse> getMessages(
            Long connectionId,
            User currentUser) {

        Connection connection =
                connectionRepository.findById(connectionId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Connection not found"
                                )
                        );

        boolean isSender =
                connection.getSender().getId()
                        .equals(currentUser.getId());

        boolean isReceiver =
                connection.getReceiver().getId()
                        .equals(currentUser.getId());

        if (!isSender && !isReceiver) {

            throw new BadRequestException(
                    "You are not part of this connection"
            );
        }

        if (connection.getStatus()
                != ConnectionStatus.ACCEPTED) {

            throw new BadRequestException(
                    "Chat is available only for accepted connections"
            );
        }

        return messageRepository
                .findByConnectionIdOrderBySentAtAsc(connectionId)
                .stream()
                .map(this::convertToResponse)
                .toList();
    }


    // =========================================================
    // MARK MESSAGES AS READ
    // =========================================================

   @Transactional
public int markMessagesAsRead(
        Long connectionId,
        User currentUser) {

    System.out.println("================================");
    System.out.println("MARKING MESSAGES AS READ");
    System.out.println("CONNECTION ID: " + connectionId);
    System.out.println("USER ID: " + currentUser.getId());
    System.out.println("================================");

    int updated =
            messageRepository.markMessagesAsRead(
                    connectionId,
                    currentUser.getId()
            );

    System.out.println(
            "MESSAGES MARKED AS READ: " + updated
    );

    return updated;
}

    public long getUnreadMessageCount(User currentUser) {

    return messageRepository
            .findByReceiverIdAndReadFalse(
                    currentUser.getId()
            )
            .size();
}


    // =========================================================
    // CONVERT MESSAGE TO RESPONSE
    // =========================================================

    private MessageResponse convertToResponse(
            Message message) {

        return new MessageResponse(
                message.getId(),
                message.getSender().getId(),
                message.getReceiver().getId(),
                message.getContent(),
                message.getSentAt(),
                message.isRead()
        );
    }
}