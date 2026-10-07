package com.skillbridge.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.skillbridge.entity.SkillCategory;

public interface SkillCategoryRepository
        extends JpaRepository<SkillCategory, Long> {

    Optional<SkillCategory> findByName(String name);
}