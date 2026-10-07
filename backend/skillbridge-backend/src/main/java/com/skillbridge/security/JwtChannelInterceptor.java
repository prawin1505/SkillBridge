package com.skillbridge.security;

import java.util.List;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessagingException;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import com.skillbridge.entity.User;
import com.skillbridge.repository.UserRepository;
import com.skillbridge.service.PresenceService;

@Component
public class JwtChannelInterceptor implements ChannelInterceptor {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final PresenceService presenceService;

    public JwtChannelInterceptor(
            JwtService jwtService,
            UserRepository userRepository,
            PresenceService presenceService) {

        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.presenceService = presenceService;
    }

    @Override
    public Message<?> preSend(
            Message<?> message,
            MessageChannel channel) {

        StompHeaderAccessor accessor =
                StompHeaderAccessor.getAccessor(
                        message,
                        StompHeaderAccessor.class
                );

        if (accessor == null) {

            System.out.println(
                    "❌ ERROR: STOMP ACCESSOR IS NULL"
            );

            return message;
        }

        StompCommand command =
                accessor.getCommand();

        System.out.println(
                "------------------------------------"
        );

        System.out.println(
                "STOMP COMMAND: " + command
        );


        // =====================================================
        // CONNECT
        // =====================================================

        if (StompCommand.CONNECT.equals(command)) {

            String authHeader =
                    accessor.getFirstNativeHeader(
                            "Authorization"
                    );

            System.out.println(
                    "STOMP AUTHORIZATION: "
                            + authHeader
            );


            // -------------------------------------------------
            // CHECK AUTHORIZATION HEADER
            // -------------------------------------------------

            if (authHeader == null ||
                    !authHeader.startsWith("Bearer ")) {

                System.out.println(
                        "❌ ERROR: Authorization header missing"
                );

                throw new MessagingException(
                        "WebSocket authentication required"
                );
            }


            // -------------------------------------------------
            // EXTRACT TOKEN
            // -------------------------------------------------

            String token =
                    authHeader.substring(7).trim();

            if (token.isEmpty()) {

                System.out.println(
                        "❌ ERROR: JWT token is empty"
                );

                throw new MessagingException(
                        "JWT token is empty"
                );
            }


            // -------------------------------------------------
            // VALIDATE JWT
            // -------------------------------------------------

            if (!jwtService.isTokenValid(token)) {

                System.out.println(
                        "❌ ERROR: JWT TOKEN INVALID"
                );

                throw new MessagingException(
                        "Invalid or expired JWT token"
                );
            }

            System.out.println(
                    "✅ JWT TOKEN IS VALID"
            );


            // -------------------------------------------------
            // GET EMAIL FROM TOKEN
            // -------------------------------------------------

            String email =
                    jwtService.extractEmail(token);

            System.out.println(
                    "JWT EMAIL: " + email
            );


            // -------------------------------------------------
            // FIND USER
            // -------------------------------------------------

            User user =
                    userRepository
                            .findByEmail(email)
                            .orElseThrow(() ->
                                    new MessagingException(
                                            "User not found"
                                    )
                            );


            // -------------------------------------------------
            // CHECK USER ACTIVE
            // -------------------------------------------------

            if (!user.isActive()) {

                System.out.println(
                        "❌ USER ACCOUNT IS INACTIVE"
                );

                throw new MessagingException(
                        "User account is inactive"
                );
            }


            // -------------------------------------------------
            // GET ROLE
            // -------------------------------------------------

            String role =
                    user.getRole().getName();

            if (role.startsWith("ROLE_")) {

                role =
                        role.substring(5);
            }


            // -------------------------------------------------
            // CREATE AUTHENTICATION
            // -------------------------------------------------

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            user,
                            null,
                            List.of(
                                    new SimpleGrantedAuthority(
                                            "ROLE_" + role
                                    )
                            )
                    );


            // -------------------------------------------------
            // SET PRINCIPAL DETAILS
            // -------------------------------------------------

            authentication.setDetails(
                    user.getEmail()
            );


            // -------------------------------------------------
            // SET WEBSOCKET USER
            // -------------------------------------------------

            accessor.setUser(
                    authentication
            );

            accessor.setLeaveMutable(true);


            // -------------------------------------------------
            // GET SESSION ID
            // -------------------------------------------------

            String sessionId =
                    accessor.getSessionId();


            // -------------------------------------------------
            // MARK USER ONLINE
            // -------------------------------------------------

            if (sessionId != null) {

                presenceService.userConnected(
                        user.getId(),
                        sessionId
                );
            }


            // -------------------------------------------------
            // DEBUG
            // -------------------------------------------------

            System.out.println(
                    "===================================="
            );

            System.out.println(
                    "🟢 WEBSOCKET USER: "
                            + user.getEmail()
            );

            System.out.println(
                    "🟢 WEBSOCKET USER ID: "
                            + user.getId()
            );

            System.out.println(
                    "🟢 SESSION ID: "
                            + sessionId
            );

            System.out.println(
                    "🟢 PRINCIPAL SET: "
                            + accessor.getUser()
            );

            System.out.println(
                    "🟢 USER MARKED ONLINE"
            );

            System.out.println(
                    "===================================="
            );

            return message;
        }


        // =====================================================
        // SUBSCRIBE
        // =====================================================

        if (StompCommand.SUBSCRIBE.equals(command)) {

            System.out.println(
                    "SUBSCRIBE PRINCIPAL: "
                            + accessor.getUser()
            );

            if (accessor.getUser() == null) {

                System.out.println(
                        "❌ ERROR: SUBSCRIBE PRINCIPAL IS NULL"
                );

                throw new MessagingException(
                        "WebSocket authentication missing"
                );
            }

            return message;
        }


        // =====================================================
        // SEND
        // =====================================================

        if (StompCommand.SEND.equals(command)) {

            System.out.println(
                    "SEND PRINCIPAL: "
                            + accessor.getUser()
            );

            if (accessor.getUser() == null) {

                System.out.println(
                        "❌ ERROR: SEND PRINCIPAL IS NULL"
                );

                throw new MessagingException(
                        "WebSocket authentication missing"
                );
            }

            return message;
        }


        // =====================================================
        // DISCONNECT
        // =====================================================

        if (StompCommand.DISCONNECT.equals(command)) {

            System.out.println(
                    "DISCONNECT PRINCIPAL: "
                            + accessor.getUser()
            );

            /*
             * We intentionally DO NOT remove the user
             * from PresenceService here.
             *
             * The SessionDisconnectEvent will handle
             * the cleanup reliably.
             */

            return message;
        }


        // =====================================================
        // OTHER COMMANDS
        // =====================================================

        return message;
    }
}