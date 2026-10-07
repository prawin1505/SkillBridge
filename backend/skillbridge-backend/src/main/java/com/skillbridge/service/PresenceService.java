package com.skillbridge.service;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

@Service
public class PresenceService {

    /*
     * Stores:
     *
     * User ID
     *     ↓
     * Set of WebSocket session IDs
     *
     * Example:
     *
     * User 1 → [sessionA, sessionB]
     * User 2 → [sessionC]
     *
     * This is important because the same user
     * can open SkillBridge in multiple tabs.
     */
    private final ConcurrentHashMap<Long, Set<String>> onlineUsers =
            new ConcurrentHashMap<>();


    // =========================================================
    // USER CONNECTED
    // =========================================================

    public void userConnected(
            Long userId,
            String sessionId) {

        if (userId == null || sessionId == null) {
            return;
        }

        onlineUsers
                .computeIfAbsent(
                        userId,
                        key -> ConcurrentHashMap.newKeySet()
                )
                .add(sessionId);

        System.out.println(
                "🟢 USER ONLINE"
                        + " | USER ID: " + userId
                        + " | SESSION: " + sessionId
        );

        printOnlineUsers();
    }


    // =========================================================
    // USER DISCONNECTED
    // =========================================================

    public void userDisconnected(
            Long userId,
            String sessionId) {

        if (userId == null || sessionId == null) {
            return;
        }

        Set<String> sessions =
                onlineUsers.get(userId);

        if (sessions == null) {
            return;
        }

        sessions.remove(sessionId);


        /*
         * Only mark the user offline when
         * ALL their WebSocket sessions are closed.
         */
        if (sessions.isEmpty()) {

            onlineUsers.remove(userId);

            System.out.println(
                    "🔴 USER OFFLINE"
                            + " | USER ID: " + userId
            );

        } else {

            System.out.println(
                    "🟡 USER STILL ONLINE"
                            + " | USER ID: " + userId
                            + " | ACTIVE SESSIONS: "
                            + sessions.size()
            );
        }

        printOnlineUsers();
    }


    // =========================================================
    // CHECK USER ONLINE
    // =========================================================

    public boolean isOnline(Long userId) {

        Set<String> sessions =
                onlineUsers.get(userId);

        return sessions != null
                && !sessions.isEmpty();
    }


    // =========================================================
    // GET ALL ONLINE USERS
    // =========================================================

    public Set<Long> getOnlineUsers() {

        return Set.copyOf(
                onlineUsers.keySet()
        );
    }


    // =========================================================
    // DEBUG
    // =========================================================

    private void printOnlineUsers() {

        System.out.println(
                "===================================="
        );

        System.out.println(
                "CURRENT ONLINE USERS: "
                        + onlineUsers.keySet()
        );

        System.out.println(
                "===================================="
        );
    }
}