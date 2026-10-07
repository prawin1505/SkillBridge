package com.skillbridge.dto;

import java.util.List;

public class MatchResponse {

    private Long userId;
    private String firstName;
    private String lastName;
    private String email;

    private int matchScore;

    private List<String> youCanTeach;
    private List<String> youCanLearn;

    private List<String> theyCanTeach;
    private List<String> theyCanLearn;

    public MatchResponse(
            Long userId,
            String firstName,
            String lastName,
            String email,
            int matchScore,
            List<String> youCanTeach,
            List<String> youCanLearn,
            List<String> theyCanTeach,
            List<String> theyCanLearn) {

        this.userId = userId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.matchScore = matchScore;
        this.youCanTeach = youCanTeach;
        this.youCanLearn = youCanLearn;
        this.theyCanTeach = theyCanTeach;
        this.theyCanLearn = theyCanLearn;
    }

    public Long getUserId() {
        return userId;
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

    public int getMatchScore() {
        return matchScore;
    }

    public List<String> getYouCanTeach() {
        return youCanTeach;
    }

    public List<String> getYouCanLearn() {
        return youCanLearn;
    }

    public List<String> getTheyCanTeach() {
        return theyCanTeach;
    }

    public List<String> getTheyCanLearn() {
        return theyCanLearn;
    }
}