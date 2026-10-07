package com.skillbridge.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.skillbridge.dto.AddUserSkillRequest;
import com.skillbridge.entity.Skill;
import com.skillbridge.entity.User;
import com.skillbridge.entity.UserSkill;
import com.skillbridge.repository.SkillRepository;
import com.skillbridge.repository.UserSkillRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users/me/skills")
public class UserSkillController {

    private final UserSkillRepository userSkillRepository;
    private final SkillRepository skillRepository;

    public UserSkillController(
            UserSkillRepository userSkillRepository,
            SkillRepository skillRepository) {

        this.userSkillRepository = userSkillRepository;
        this.skillRepository = skillRepository;
    }


    // ==========================
    // ADD SKILL
    // ==========================

    @PostMapping
    public ResponseEntity<UserSkill> addSkill(
            @Valid @RequestBody AddUserSkillRequest request,
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();

        Skill skill = skillRepository.findById(request.getSkillId())
                .orElseThrow(() ->
                        new RuntimeException("Skill not found"));

        UserSkill userSkill = new UserSkill();

        userSkill.setUser(user);
        userSkill.setSkill(skill);
        userSkill.setType(request.getType());
        userSkill.setLevel(request.getLevel());

        return ResponseEntity.ok(
                userSkillRepository.save(userSkill)
        );
    }


    // ==========================
    // GET MY SKILLS
    // ==========================

    @GetMapping
    public ResponseEntity<List<UserSkill>> getMySkills(
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();

        return ResponseEntity.ok(
                userSkillRepository.findByUserId(user.getId())
        );
    }


    // ==========================
    // DELETE MY SKILL
    // ==========================

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteSkill(
            @PathVariable Long id,
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();

        UserSkill userSkill =
                userSkillRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User skill not found"
                                ));

        // Security check:
        // User can delete only their own skill
        if (!userSkill.getUser().getId().equals(user.getId())) {

            return ResponseEntity
                    .status(403)
                    .body("You cannot delete this skill");
        }

        userSkillRepository.delete(userSkill);

        return ResponseEntity.ok(
                "Skill removed successfully"
        );
    }
}