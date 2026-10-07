package com.skillbridge.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

import com.skillbridge.dto.MessageResponse;
import com.skillbridge.dto.SendMessageRequest;
import com.skillbridge.entity.User;
import com.skillbridge.service.MessageService;

@Controller
public class WebSocketChatController {

    private final MessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketChatController(
            MessageService messageService,
            SimpMessagingTemplate messagingTemplate) {

        this.messageService = messageService;
        this.messagingTemplate = messagingTemplate;
    }

    // =========================================================
    // SEND MESSAGE THROUGH WEBSOCKET
    // =========================================================

    @MessageMapping("/chat")
    public void sendMessage(
            SendMessageRequest request,
            StompHeaderAccessor headerAccessor) {

        System.out.println("====================================");
        System.out.println("WEBSOCKET MESSAGE RECEIVED");

        // =====================================================
        // CHECK REQUEST
        // =====================================================

        if (request == null) {

            System.out.println(
                    "ERROR: REQUEST IS NULL"
            );

            return;
        }

        System.out.println(
                "CONNECTION ID: "
                        + request.getConnectionId()
        );

        System.out.println(
                "MESSAGE: "
                        + request.getContent()
        );

        // =====================================================
        // CHECK AUTHENTICATION
        // =====================================================

        if (headerAccessor.getUser() == null) {

            System.out.println(
                    "ERROR: WEBSOCKET USER IS NULL"
            );

            return;
        }

        // =====================================================
        // GET AUTHENTICATION
        // =====================================================

        Authentication authentication =
                (Authentication) headerAccessor.getUser();

        System.out.println(
                "AUTHENTICATION: "
                        + authentication
        );

        // =====================================================
        // GET CURRENT USER
        // =====================================================

        Object principal =
                authentication.getPrincipal();

        if (!(principal instanceof User)) {

            System.out.println(
                    "ERROR: PRINCIPAL IS NOT USER"
            );

            return;
        }

        User currentUser =
                (User) principal;

        System.out.println(
                "WEBSOCKET USER: "
                        + currentUser.getEmail()
        );

        System.out.println(
                "WEBSOCKET USER ID: "
                        + currentUser.getId()
        );

        // =====================================================
        // VALIDATE CONNECTION ID
        // =====================================================

        Long connectionId =
                request.getConnectionId();

        if (connectionId == null ||
                connectionId <= 0) {

            System.out.println(
                    "ERROR: INVALID CONNECTION ID"
            );

            return;
        }

        // =====================================================
        // SAVE MESSAGE
        // =====================================================

        MessageResponse response =
                messageService.sendMessage(
                        connectionId,
                        request,
                        currentUser
                );

        System.out.println(
                "MESSAGE SAVED SUCCESSFULLY"
        );

        System.out.println(
                "MESSAGE ID: "
                        + response.getId()
        );

        // =====================================================
        // BROADCAST TO BOTH USERS
        // =====================================================

        String destination =
                "/topic/chat/" + connectionId;

        System.out.println(
                "BROADCAST DESTINATION: "
                        + destination
        );

        messagingTemplate.convertAndSend(
                destination,
                response
        );

        System.out.println(
                "MESSAGE BROADCAST SUCCESSFULLY"
        );

        System.out.println("====================================");
    }
}