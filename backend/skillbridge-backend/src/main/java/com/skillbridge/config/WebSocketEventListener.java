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
public class WebSocketEventListener {

    private final PresenceService presenceService;
    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketEventListener(
            PresenceService presenceService,
            SimpMessagingTemplate messagingTemplate) {

        this.presenceService = presenceService;
        this.messagingTemplate = messagingTemplate;
    }

    // =========================================================
    // USER CONNECTED
    // =========================================================

    @EventListener
    public void handleWebSocketConnectListener(
            SessionConnectEvent event) {

        System.out.println("====================================");
        System.out.println("🟢 WEBSOCKET SESSION CONNECTED");

        StompHeaderAccessor accessor =
                StompHeaderAccessor.wrap(event.getMessage());

        Authentication authentication =
                getAuthentication(accessor);

        if (authentication == null) {

            System.out.println(
                    "⚠️ CONNECTED USER AUTHENTICATION IS NULL"
            );

            System.out.println("====================================");

            return;
        }

        Object principal =
                authentication.getPrincipal();

        if (!(principal instanceof User user)) {

            System.out.println(
                    "⚠️ CONNECTED PRINCIPAL IS NOT USER"
            );

            System.out.println(
                    "PRINCIPAL: " + principal
            );

            System.out.println("====================================");

            return;
        }

        String sessionId =
                accessor.getSessionId();

        if (sessionId == null) {

            System.out.println(
                    "⚠️ SESSION ID IS NULL"
            );

            System.out.println("====================================");

            return;
        }

        System.out.println(
                "CONNECTED USER: "
                        + user.getEmail()
        );

        System.out.println(
                "CONNECTED USER ID: "
                        + user.getId()
        );

        System.out.println(
                "CONNECTED SESSION ID: "
                        + sessionId
        );

        // -----------------------------------------------------
        // REGISTER USER SESSION
        // -----------------------------------------------------

        presenceService.userConnected(
                user.getId(),
                sessionId
        );

        // -----------------------------------------------------
        // BROADCAST UPDATED PRESENCE
        // -----------------------------------------------------

        broadcastPresence();

        System.out.println(
                "✅ USER PRESENCE UPDATED AFTER CONNECT"
        );

        System.out.println("====================================");
    }


    // =========================================================
    // USER DISCONNECTED
    // =========================================================

    @EventListener
    public void handleWebSocketDisconnectListener(
            SessionDisconnectEvent event) {

        System.out.println("====================================");
        System.out.println("🔴 WEBSOCKET SESSION DISCONNECTED");

        StompHeaderAccessor accessor =
                StompHeaderAccessor.wrap(event.getMessage());

        Authentication authentication =
                getAuthentication(accessor);

        if (authentication == null) {

            System.out.println(
                    "⚠️ DISCONNECTED USER AUTHENTICATION IS NULL"
            );

            System.out.println("====================================");

            return;
        }

        Object principal =
                authentication.getPrincipal();

        if (!(principal instanceof User user)) {

            System.out.println(
                    "⚠️ DISCONNECTED PRINCIPAL IS NOT USER"
            );

            System.out.println(
                    "PRINCIPAL: " + principal
            );

            System.out.println("====================================");

            return;
        }

        String sessionId =
                accessor.getSessionId();

        System.out.println(
                "DISCONNECTED USER: "
                        + user.getEmail()
        );

        System.out.println(
                "DISCONNECTED USER ID: "
                        + user.getId()
        );

        System.out.println(
                "DISCONNECTED SESSION ID: "
                        + sessionId
        );

        System.out.println(
                "DISCONNECT CLOSE STATUS: "
                        + event.getCloseStatus()
        );

        // -----------------------------------------------------
        // REMOVE ONLY THIS SESSION
        // -----------------------------------------------------

        presenceService.userDisconnected(
                user.getId(),
                sessionId
        );

        // -----------------------------------------------------
        // BROADCAST UPDATED PRESENCE
        // -----------------------------------------------------

        broadcastPresence();

        System.out.println(
                "📡 USER PRESENCE UPDATED AFTER DISCONNECT"
        );

        System.out.println("====================================");
    }


    // =========================================================
    // GET AUTHENTICATION
    // =========================================================

    private Authentication getAuthentication(
            StompHeaderAccessor accessor) {

        if (accessor == null) {
            return null;
        }

        if (accessor.getUser() == null) {
            return null;
        }

        if (!(accessor.getUser()
                instanceof Authentication authentication)) {

            return null;
        }

        return authentication;
    }


    // =========================================================
    // BROADCAST PRESENCE
    // =========================================================

    private void broadcastPresence() {

        Set<Long> onlineUsers =
                presenceService.getOnlineUsers();

        System.out.println(
                "📡 ONLINE USERS: "
                        + onlineUsers
        );

        messagingTemplate.convertAndSend(
                "/topic/presence",
                onlineUsers
        );

        System.out.println(
                "📡 PRESENCE BROADCAST SENT"
        );
    }
}