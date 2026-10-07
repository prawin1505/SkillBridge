package com.skillbridge.dto;

import com.skillbridge.entity.ConnectionStatus;

public class ConnectionUserResponse {

    private Long connectionId;

    private Long userId;
    private String firstName;
    private String lastName;
    private String email;

    private ConnectionStatus status;

    public ConnectionUserResponse(
            Long connectionId,
            Long userId,
            String firstName,
            String lastName,
            String email,
            ConnectionStatus status) {

        this.connectionId = connectionId;
        this.userId = userId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.status = status;
    }

    public Long getConnectionId() {
        return connectionId;
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

    public ConnectionStatus getStatus() {
        return status;
    }
}