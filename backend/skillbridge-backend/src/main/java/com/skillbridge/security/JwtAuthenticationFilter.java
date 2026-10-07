package com.skillbridge.security;

import java.io.IOException;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.skillbridge.entity.User;
import com.skillbridge.repository.UserRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            UserRepository userRepository) {

        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getServletPath();

        // ==========================================
        // PUBLIC AUTHENTICATION ENDPOINTS
        // ==========================================

        if (path.startsWith("/api/auth/")) {
            filterChain.doFilter(request, response);
            return;
        }

        // ==========================================
        // WEBSOCKET + CORS
        // ==========================================

        if (path.startsWith("/ws")
                || "OPTIONS".equalsIgnoreCase(request.getMethod())) {

            filterChain.doFilter(request, response);
            return;
        }

        // ==========================================
        // GET JWT TOKEN
        // ==========================================

        String authHeader =
                request.getHeader("Authorization");

        // No Authorization header
        if (authHeader == null
                || !authHeader.startsWith("Bearer ")) {

            filterChain.doFilter(request, response);
            return;
        }

        String token =
                authHeader.substring(7).trim();

        // Empty token
        if (token.isEmpty()) {
            filterChain.doFilter(request, response);
            return;
        }

        // ==========================================
        // VALIDATE JWT
        // ==========================================

        try {

            if (jwtService.isTokenValid(token)) {

                String email =
                        jwtService.extractEmail(token);

                User user =
                        userRepository
                                .findByEmail(email)
                                .orElse(null);

                if (user != null && user.isActive()) {

                    String role =
                            user.getRole().getName();

                    // Prevent ROLE_ROLE_USER
                    if (role.startsWith("ROLE_")) {
                        role = role.substring(5);
                    }

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

                    SecurityContextHolder
                            .getContext()
                            .setAuthentication(authentication);

                    System.out.println(
                            "JWT AUTHENTICATION SUCCESS: "
                                    + email
                    );

                    System.out.println(
                            "USER ROLE: ROLE_"
                                    + role
                    );
                }
            }

        } catch (Exception e) {

            System.out.println(
                    "JWT AUTHENTICATION ERROR: "
                            + e.getMessage()
            );

            SecurityContextHolder.clearContext();
        }

        // Continue request
        filterChain.doFilter(request, response);
    }
}