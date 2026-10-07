package com.skillbridge.config;

import java.util.Set;

import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import com.skillbridge.entity.User;
import com.skillbridge.service.PresenceService;

@Component
public class PresenceEventListener {

    private final PresenceService presenceService;
    private final SimpMessagingTemplate messagingTemplate;

    public PresenceEventListener(
            PresenceService presenceService,
            SimpMessagingTemplate messagingTemplate) {

        this.presenceService = presenceService;
        this.messagingTemplate = messagingTemplate;
    }

    // =========================================================
    // USER CONNECTED
    // =========================================================

    @EventListener
    public void handleConnect(SessionConnectEvent event) {

        StompHeaderAccessor accessor =
                StompHeaderAccessor.wrap(event.getMessage());

        Authentication authentication =
                (Authentication) accessor.getUser();

        System.out.println("====================================");
        System.out.println("WEBSOCKET CONNECT EVENT");

        if (authentication == null) {

            System.out.println(
                    "CONNECT ERROR: AUTHENTICATION IS NULL"
            );

            System.out.println("====================================");
            return;
        }

        Object principal =
                authentication.getPrincipal();

        if (!(principal instanceof User user)) {

            System.out.println(
                    "CONNECT ERROR: INVALID USER PRINCIPAL"
            );

            System.out.println("====================================");
            return;
        }

        String sessionId =
                accessor.getSessionId();

        if (sessionId == null) {

            System.out.println(
                    "CONNECT ERROR: SESSION ID IS NULL"
            );

            System.out.println("====================================");
            return;
        }

        System.out.println(
                "USER: " + user.getEmail()
        );

        System.out.println(
                "USER ID: " + user.getId()
        );

        System.out.println(
                "SESSION ID: " + sessionId
        );

        // =====================================================
        // REGISTER USER SESSION
        // =====================================================

        presenceService.userConnected(
                user.getId(),
                sessionId
        );

        // =====================================================
        // BROADCAST NEW ONLINE USERS
        // =====================================================

        broadcastPresence();

        System.out.println(
                "USER PRESENCE UPDATED AFTER CONNECT"
        );

        System.out.println("====================================");
    }


    // =========================================================
    // USER DISCONNECTED
    // =========================================================

    @EventListener
    public void handleDisconnect(
            SessionDisconnectEvent event) {

        StompHeaderAccessor accessor =
                StompHeaderAccessor.wrap(event.getMessage());

        Authentication authentication =
                (Authentication) accessor.getUser();

        System.out.println("====================================");
        System.out.println("WEBSOCKET DISCONNECT EVENT");

        if (authentication == null) {

            System.out.println(
                    "DISCONNECT ERROR: AUTHENTICATION IS NULL"
            );

            System.out.println("====================================");
            return;
        }

        Object principal =
                authentication.getPrincipal();

        if (!(principal instanceof User user)) {

            System.out.println(
                    "DISCONNECT ERROR: INVALID USER PRINCIPAL"
            );

            System.out.println("====================================");
            return;
        }

        String sessionId =
                accessor.getSessionId();

        System.out.println(
                "USER: " + user.getEmail()
        );

        System.out.println(
                "USER ID: " + user.getId()
        );

        System.out.println(
                "SESSION ID: " + sessionId
        );

        // =====================================================
        // REMOVE ONLY THIS SESSION
        // =====================================================

        presenceService.userDisconnected(
                user.getId(),
                sessionId
        );

        // =====================================================
        // BROADCAST UPDATED ONLINE USERS
        // =====================================================

        broadcastPresence();

        System.out.println(
                "USER PRESENCE UPDATED AFTER DISCONNECT"
        );

        System.out.println("====================================");
    }


    // =========================================================
    // BROADCAST PRESENCE
    // =========================================================

    private void broadcastPresence() {

        Set<Long> onlineUsers =
                presenceService.getOnlineUsers();

        System.out.println(
                "📡 ONLINE USERS: " + onlineUsers
        );

        messagingTemplate.convertAndSend(
                "/topic/presence",
                onlineUsers
        );
    }
}