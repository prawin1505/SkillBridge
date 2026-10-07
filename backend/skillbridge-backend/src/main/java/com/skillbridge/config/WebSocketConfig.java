package com.skillbridge.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import com.skillbridge.security.JwtChannelInterceptor;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig
        implements WebSocketMessageBrokerConfigurer {

    private final JwtChannelInterceptor jwtChannelInterceptor;

    public WebSocketConfig(
            JwtChannelInterceptor jwtChannelInterceptor) {

        this.jwtChannelInterceptor = jwtChannelInterceptor;
    }

    // =========================================================
    // MESSAGE BROKER
    // =========================================================

    @Override
    public void configureMessageBroker(
            MessageBrokerRegistry config) {

        // Server broadcasts messages through /topic
        config.enableSimpleBroker("/topic");

        // Client sends messages to /app
        config.setApplicationDestinationPrefixes("/app");
    }

    // =========================================================
    // WEBSOCKET ENDPOINT
    // =========================================================

    @Override
    public void registerStompEndpoints(
            StompEndpointRegistry registry) {

        registry
                .addEndpoint("/ws")
                .setAllowedOriginPatterns("*");
    }

    // =========================================================
    // JWT AUTHENTICATION
    // =========================================================

    @Override
    public void configureClientInboundChannel(
            ChannelRegistration registration) {

        registration.interceptors(
                jwtChannelInterceptor
        );
    }
}