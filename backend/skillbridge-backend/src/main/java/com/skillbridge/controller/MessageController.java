package com.skillbridge.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.skillbridge.dto.MessageResponse;
import com.skillbridge.dto.SendMessageRequest;
import com.skillbridge.entity.User;
import com.skillbridge.service.MessageService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final MessageService messageService;

    public MessageController(
            MessageService messageService) {

        this.messageService = messageService;
    }


    // =========================================================
    // SEND MESSAGE
    // =========================================================

    @PostMapping("/{connectionId}")
    public ResponseEntity<MessageResponse> sendMessage(
            @PathVariable Long connectionId,
            @Valid @RequestBody SendMessageRequest request,
            Authentication authentication) {

        System.out.println(
                ">>> MESSAGE CONTROLLER REACHED"
        );

        User user =
                (User) authentication.getPrincipal();

        return ResponseEntity.ok(
                messageService.sendMessage(
                        connectionId,
                        request,
                        user
                )
        );
    }


    // =========================================================
    // GET MESSAGES
    // =========================================================

    @GetMapping("/{connectionId}")
    public ResponseEntity<List<MessageResponse>> getMessages(
            @PathVariable Long connectionId,
            Authentication authentication) {

        System.out.println(
                ">>> GET MESSAGE CONTROLLER REACHED"
        );

        User user =
                (User) authentication.getPrincipal();

        return ResponseEntity.ok(
                messageService.getMessages(
                        connectionId,
                        user
                )
        );
    }


    // =========================================================
    // MARK MESSAGES AS READ
    // =========================================================
@PutMapping("/{connectionId}/read")
public ResponseEntity<Map<String, Object>> markMessagesAsRead(
        @PathVariable Long connectionId,
        Authentication authentication) {

    System.out.println(
            ">>> MARK READ CONTROLLER REACHED"
    );

    User user =
            (User) authentication.getPrincipal();

    int updated =
            messageService.markMessagesAsRead(
                    connectionId,
                    user
            );

    System.out.println(
            ">>> UPDATED MESSAGES: " + updated
    );

    return ResponseEntity.ok(
            Map.of(
                    "success", true,
                    "updated", updated
            )
    );
}
    @GetMapping("/unread/count")
public ResponseEntity<Map<String, Long>> getUnreadMessageCount(
        Authentication authentication) {

    User user =
            (User) authentication.getPrincipal();

    long count =
            messageService.getUnreadMessageCount(user);

    return ResponseEntity.ok(
            Map.of("unreadCount", count)
    );
}

}