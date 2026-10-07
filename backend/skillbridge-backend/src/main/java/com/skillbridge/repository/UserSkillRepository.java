package com.skillbridge.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.skillbridge.entity.SkillType;
import com.skillbridge.entity.UserSkill;

public interface UserSkillRepository
        extends JpaRepository<UserSkill, Long> {

    List<UserSkill> findByUserId(Long userId);

    List<UserSkill> findByUserIdAndType(
            Long userId,
            SkillType type
    );
}