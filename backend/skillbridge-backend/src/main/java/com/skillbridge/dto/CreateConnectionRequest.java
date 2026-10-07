package com.skillbridge.dto;

import jakarta.validation.constraints.NotNull;

public class CreateConnectionRequest {

    @NotNull(message = "Receiver ID is required")
    private Long receiverId;

    public Long getReceiverId() {
        return receiverId;
    }

    public void setReceiverId(Long receiverId) {
        this.receiverId = receiverId;
    }
}