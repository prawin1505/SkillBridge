package com.skillbridge.dto;

public class WebSocketMessage {

    private Long connectionId;
    private Long senderId;
    private String content;

    public WebSocketMessage() {
    }

    public WebSocketMessage(
            Long connectionId,
            Long senderId,
            String content) {

        this.connectionId = connectionId;
        this.senderId = senderId;
        this.content = content;
    }

    public Long getConnectionId() {
        return connectionId;
    }

    public void setConnectionId(Long connectionId) {
        this.connectionId = connectionId;
    }

    public Long getSenderId() {
        return senderId;
    }

    public void setSenderId(Long senderId) {
        this.senderId = senderId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}