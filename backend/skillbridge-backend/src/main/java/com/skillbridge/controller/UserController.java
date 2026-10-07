package com.skillbridge.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.skillbridge.dto.DiscoverUserResponse;
import com.skillbridge.dto.OtherUserProfileResponse;
import com.skillbridge.dto.UserProfileResponse;
import com.skillbridge.entity.SkillType;
import com.skillbridge.entity.User;
import com.skillbridge.entity.UserSkill;
import com.skillbridge.repository.UserRepository;
import com.skillbridge.repository.UserSkillRepository;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final UserSkillRepository userSkillRepository;

    public UserController(
            UserRepository userRepository,
            UserSkillRepository userSkillRepository) {

        this.userRepository = userRepository;
        this.userSkillRepository = userSkillRepository;
    }


    // ==========================================
    // CURRENT USER
    // ==========================================

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getCurrentUser(
            Authentication authentication) {

        User user =
                (User) authentication.getPrincipal();

        UserProfileResponse response =
                new UserProfileResponse(
                        user.getId(),
                        user.getFirstName(),
                        user.getLastName(),
                        user.getEmail(),
                        user.getBio(),
                        user.getRole().getName()
                );

        return ResponseEntity.ok(response);
    }


    // ==========================================
    // DISCOVER USERS
    // ==========================================

    @GetMapping("/discover")
    public ResponseEntity<List<DiscoverUserResponse>> discoverUsers(
            @RequestParam(required = false) String search,
            Authentication authentication) {

        User currentUser =
                (User) authentication.getPrincipal();

        Long currentUserId =
                currentUser.getId();

        System.out.println("====================================");
        System.out.println("DISCOVER USERS");
        System.out.println(
                "CURRENT USER ID: "
                        + currentUserId
        );
        System.out.println(
                "CURRENT USER EMAIL: "
                        + currentUser.getEmail()
        );
        System.out.println("====================================");


        // Get active users except current user
        List<User> users =
                userRepository.findByIdNotAndActiveTrue(
                        currentUserId
                );


        // ==========================================
        // EXTRA SAFETY FILTER
        // ==========================================

        users = users.stream()
                .filter(user ->
                        user.getId() != null &&
                        !user.getId().equals(currentUserId)
                )
                .collect(Collectors.toList());


        // ==========================================
        // SEARCH
        // ==========================================

        if (search != null &&
                !search.trim().isEmpty()) {

            String keyword =
                    search.trim().toLowerCase();

            users = users.stream()
                    .filter(user ->

                            // First name
                            (
                                user.getFirstName() != null &&
                                user.getFirstName()
                                        .toLowerCase()
                                        .contains(keyword)
                            )

                            ||

                            // Last name
                            (
                                user.getLastName() != null &&
                                user.getLastName()
                                        .toLowerCase()
                                        .contains(keyword)
                            )

                            ||

                            // Email
                            (
                                user.getEmail() != null &&
                                user.getEmail()
                                        .toLowerCase()
                                        .contains(keyword)
                            )
                    )
                    .collect(Collectors.toList());
        }


        // ==========================================
        // CONVERT TO RESPONSE
        // ==========================================

        List<DiscoverUserResponse> response =
                users.stream()
                        .map(user ->
                                new DiscoverUserResponse(
                                        user.getId(),
                                        user.getFirstName(),
                                        user.getLastName(),
                                        user.getEmail()
                                )
                        )
                        .collect(Collectors.toList());


        System.out.println(
                "DISCOVERED USERS COUNT: "
                        + response.size()
        );


        return ResponseEntity.ok(response);
    }


    // ==========================================
    // VIEW OTHER USER PROFILE
    // ==========================================

    @GetMapping("/{id}")
    public ResponseEntity<OtherUserProfileResponse> getUserProfile(
            @PathVariable Long id,
            Authentication authentication) {

        // ==========================================
        // CURRENT USER
        // ==========================================

        User currentUser =
                (User) authentication.getPrincipal();


        // ==========================================
        // PREVENT VIEWING OWN PROFILE
        // ==========================================

        if (currentUser.getId().equals(id)) {

            return ResponseEntity
                    .badRequest()
                    .build();
        }


        // ==========================================
        // FIND USER
        // ==========================================

        User user =
                userRepository.findById(id)
                        .orElse(null);


        // ==========================================
        // USER NOT FOUND / INACTIVE
        // ==========================================

        if (user == null ||
                !user.isActive()) {

            return ResponseEntity
                    .notFound()
                    .build();
        }


        // ==========================================
        // GET USER SKILLS
        // ==========================================

        List<UserSkill> userSkills =
                userSkillRepository.findByUserId(id);


        // ==========================================
        // SKILLS TO TEACH
        // ==========================================

        List<String> skillsToTeach =
                userSkills.stream()
                        .filter(userSkill ->
                                userSkill.getType()
                                        == SkillType.TEACH
                        )
                        .map(userSkill ->
                                userSkill.getSkill().getName()
                        )
                        .collect(Collectors.toList());


        // ==========================================
        // SKILLS TO LEARN
        // ==========================================

        List<String> skillsToLearn =
                userSkills.stream()
                        .filter(userSkill ->
                                userSkill.getType()
                                        == SkillType.LEARN
                        )
                        .map(userSkill ->
                                userSkill.getSkill().getName()
                        )
                        .collect(Collectors.toList());


        // ==========================================
        // CREATE PROFILE RESPONSE
        // ==========================================

        OtherUserProfileResponse response =
                new OtherUserProfileResponse(
                        user.getId(),
                        user.getFirstName(),
                        user.getLastName(),
                        user.getEmail(),
                        user.getBio(),
                        user.getRole().getName(),
                        skillsToTeach,
                        skillsToLearn
                );


        // ==========================================
        // DEBUG
        // ==========================================

        System.out.println(
                "VIEWING USER PROFILE: "
                        + user.getEmail()
        );

        System.out.println(
                "SKILLS TO TEACH: "
                        + skillsToTeach
        );

        System.out.println(
                "SKILLS TO LEARN: "
                        + skillsToLearn
        );


        return ResponseEntity.ok(response);
    }
}