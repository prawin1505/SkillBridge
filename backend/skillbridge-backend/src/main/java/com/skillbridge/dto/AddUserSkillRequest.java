package com.skillbridge.dto;

import com.skillbridge.entity.SkillLevel;
import com.skillbridge.entity.SkillType;

import jakarta.validation.constraints.NotNull;

public class AddUserSkillRequest {

    @NotNull
    private Long skillId;

    @NotNull
    private SkillType type;

    @NotNull
    private SkillLevel level;

    public Long getSkillId() {
        return skillId;
    }

    public void setSkillId(Long skillId) {
        this.skillId = skillId;
    }

    public SkillType getType() {
        return type;
    }

    public void setType(SkillType type) {
        this.type = type;
    }

    public SkillLevel getLevel() {
        return level;
    }

    public void setLevel(SkillLevel level) {
        this.level = level;
    }
}