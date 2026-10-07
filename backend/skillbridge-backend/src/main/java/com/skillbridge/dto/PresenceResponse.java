package com.skillbridge.dto;

public class PresenceResponse {

    private Long userId;
    private boolean online;

    public PresenceResponse() {
    }

    public PresenceResponse(Long userId, boolean online) {
        this.userId = userId;
        this.online = online;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public boolean isOnline() {
        return online;
    }

    public void setOnline(boolean online) {
        this.online = online;
    }
}