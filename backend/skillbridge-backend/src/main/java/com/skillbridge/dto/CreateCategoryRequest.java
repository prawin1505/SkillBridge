package com.skillbridge.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateCategoryRequest {

    @NotBlank
    private String name;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}