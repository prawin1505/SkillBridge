package com.skillbridge.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.skillbridge.dto.ConnectionResponse;
import com.skillbridge.dto.ConnectionUserResponse;
import com.skillbridge.dto.CreateConnectionRequest;
import com.skillbridge.entity.User;
import com.skillbridge.service.ConnectionService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/connections")
public class ConnectionController {

    private final ConnectionService connectionService;

    public ConnectionController(
            ConnectionService connectionService) {

        this.connectionService = connectionService;
    }

    // ================================
    // SEND CONNECTION REQUEST
    // ================================

    @PostMapping
    public ResponseEntity<ConnectionResponse> sendRequest(
            @Valid @RequestBody CreateConnectionRequest request,
            Authentication authentication) {

        User sender =
                (User) authentication.getPrincipal();

        ConnectionResponse response =
                connectionService.sendRequest(
                        sender,
                        request
                );

        return ResponseEntity.ok(response);
    }

    // ================================
    // GET SENT REQUESTS
    // ================================

    @GetMapping("/sent")
    public ResponseEntity<List<ConnectionResponse>> getSentRequests(
            Authentication authentication) {

        User user =
                (User) authentication.getPrincipal();

        return ResponseEntity.ok(
                connectionService.getSentRequests(user)
        );
    }

    // ================================
    // GET RECEIVED REQUESTS
    // ================================

    @GetMapping("/received")
    public ResponseEntity<List<ConnectionResponse>> getReceivedRequests(
            Authentication authentication) {

        User user =
                (User) authentication.getPrincipal();

        return ResponseEntity.ok(
                connectionService.getReceivedRequests(user)
        );
    }

    // ================================
    // ACCEPT REQUEST
    // ================================

    @PostMapping("/{id}/accept")
    public ResponseEntity<ConnectionResponse> acceptRequest(
            @PathVariable Long id,
            Authentication authentication) {

        User user =
                (User) authentication.getPrincipal();

        ConnectionResponse response =
                connectionService.acceptRequest(
                        id,
                        user
                );

        return ResponseEntity.ok(response);
    }

    // ================================
    // REJECT REQUEST
    // ================================

    @PostMapping("/{id}/reject")
    public ResponseEntity<ConnectionResponse> rejectRequest(
            @PathVariable Long id,
            Authentication authentication) {

        User user =
                (User) authentication.getPrincipal();

        ConnectionResponse response =
                connectionService.rejectRequest(
                        id,
                        user
                );

        return ResponseEntity.ok(response);
    }

    // ================================
    // GET MY ACCEPTED CONNECTIONS
    // ================================

    @GetMapping
    public ResponseEntity<List<ConnectionUserResponse>> getMyConnections(
            Authentication authentication) {

        User user =
                (User) authentication.getPrincipal();

        return ResponseEntity.ok(
                connectionService.getMyConnections(user)
        );
    }
}