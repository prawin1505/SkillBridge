package com.skillbridge.dto;

import java.util.List;

public class OtherUserProfileResponse {

    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String bio;
    private String role;

    private List<String> skillsToTeach;
    private List<String> skillsToLearn;

    public OtherUserProfileResponse(
            Long id,
            String firstName,
            String lastName,
            String email,
            String bio,
            String role,
            List<String> skillsToTeach,
            List<String> skillsToLearn) {

        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.bio = bio;
        this.role = role;
        this.skillsToTeach = skillsToTeach;
        this.skillsToLearn = skillsToLearn;
    }

    public Long getId() {
        return id;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getEmail() {
        return email;
    }

    public String getBio() {
        return bio;
    }

    public String getRole() {
        return role;
    }

    public List<String> getSkillsToTeach() {
        return skillsToTeach;
    }

    public List<String> getSkillsToLearn() {
        return skillsToLearn;
    }
}