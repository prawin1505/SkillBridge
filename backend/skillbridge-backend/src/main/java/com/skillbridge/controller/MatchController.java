package com.skillbridge.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.skillbridge.dto.MatchResponse;
import com.skillbridge.entity.User;
import com.skillbridge.service.MatchService;

@RestController
@RequestMapping("/api/matches")
public class MatchController {

    private final MatchService matchService;

    public MatchController(MatchService matchService) {
        this.matchService = matchService;
    }

    @GetMapping
    public ResponseEntity<List<MatchResponse>> getMatches(
            Authentication authentication) {

        User currentUser =
                (User) authentication.getPrincipal();

        return ResponseEntity.ok(
                matchService.findMatches(currentUser)
        );
    }
}