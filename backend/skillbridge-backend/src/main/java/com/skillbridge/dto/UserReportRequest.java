package com.skillbridge.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class UserReportRequest {

    @NotNull
    private Long reportedUserId;

    @NotBlank
    private String reason;

    @Size(max = 500)
    private String description;

    public Long getReportedUserId() {
        return reportedUserId;
    }

    public void setReportedUserId(Long reportedUserId) {
        this.reportedUserId = reportedUserId;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}