package com.skillbridge.dto;

public class LoginResponse {

    private String accessToken;
    private String tokenType;
    private Long userId;
    private String email;
    private String role;

    public LoginResponse(
            String accessToken,
            Long userId,
            String email,
            String role) {

        this.accessToken = accessToken;
        this.tokenType = "Bearer";
        this.userId = userId;
        this.email = email;
        this.role = role;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public String getTokenType() {
        return tokenType;
    }

    public Long getUserId() {
        return userId;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }
}