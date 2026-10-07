package com.skillbridge.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.skillbridge.service.PresenceService;

@RestController
@RequestMapping("/api/presence")
public class PresenceController {

    private final PresenceService presenceService;

    public PresenceController(
            PresenceService presenceService) {

        this.presenceService = presenceService;
    }

    // =========================================================
    // CHECK USER ONLINE STATUS
    // =========================================================

    @GetMapping("/{userId}")
    public boolean isUserOnline(
            @PathVariable Long userId) {

        return presenceService.isOnline(userId);
    }
}