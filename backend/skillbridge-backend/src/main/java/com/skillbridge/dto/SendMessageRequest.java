package com.skillbridge.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class SendMessageRequest {

    private Long connectionId;

    @NotBlank(message = "Message cannot be empty")
    @Size(
        max = 2000,
        message = "Message cannot exceed 2000 characters"
    )
    private String content;

    public SendMessageRequest() {
    }

    public Long getConnectionId() {
        return connectionId;
    }

    public void setConnectionId(Long connectionId) {
        this.connectionId = connectionId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}