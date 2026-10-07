package com.skillbridge.controller;

import com.skillbridge.dto.CreateCategoryRequest;
import com.skillbridge.dto.CreateSkillRequest;
import com.skillbridge.entity.Skill;
import com.skillbridge.entity.SkillCategory;
import com.skillbridge.repository.SkillCategoryRepository;
import com.skillbridge.repository.SkillRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/skills")
public class SkillController {

    private final SkillRepository skillRepository;
    private final SkillCategoryRepository categoryRepository;

    public SkillController(
            SkillRepository skillRepository,
            SkillCategoryRepository categoryRepository) {

        this.skillRepository = skillRepository;
        this.categoryRepository = categoryRepository;
    }

    // GET ALL CATEGORIES
    @GetMapping("/categories")
    public ResponseEntity<List<SkillCategory>> getCategories() {
        return ResponseEntity.ok(
                categoryRepository.findAll()
        );
    }

    // GET ALL SKILLS
    @GetMapping
    public ResponseEntity<List<Skill>> getSkills() {
        return ResponseEntity.ok(
                skillRepository.findAll()
        );
    }

    // CREATE CATEGORY
    @PostMapping("/admin/categories")
    public ResponseEntity<SkillCategory> createCategory(
            @Valid @RequestBody CreateCategoryRequest request) {

        SkillCategory category =
                new SkillCategory(request.getName());

        return ResponseEntity.ok(
                categoryRepository.save(category)
        );
    }

    // CREATE SKILL
    @PostMapping("/admin")
    public ResponseEntity<Skill> createSkill(
            @Valid @RequestBody CreateSkillRequest request) {

        SkillCategory category =
                categoryRepository.findById(request.getCategoryId())
                        .orElseThrow(() ->
                                new RuntimeException("Category not found"));

        Skill skill =
                new Skill(request.getName(), category);

        return ResponseEntity.ok(
                skillRepository.save(skill)
        );
    }
}