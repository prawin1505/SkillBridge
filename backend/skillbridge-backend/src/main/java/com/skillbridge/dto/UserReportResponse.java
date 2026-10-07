package com.skillbridge.dto;

import java.time.LocalDateTime;

public class UserReportResponse {

    private Long id;

    private Long reporterId;
    private String reporterName;

    private Long reportedUserId;
    private String reportedUserName;

    private String reason;
    private String description;
    private String status;

    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;

    public UserReportResponse(
            Long id,
            Long reporterId,
            String reporterName,
            Long reportedUserId,
            String reportedUserName,
            String reason,
            String description,
            String status,
            LocalDateTime createdAt,
            LocalDateTime resolvedAt) {

        this.id = id;
        this.reporterId = reporterId;
        this.reporterName = reporterName;
        this.reportedUserId = reportedUserId;
        this.reportedUserName = reportedUserName;
        this.reason = reason;
        this.description = description;
        this.status = status;
        this.createdAt = createdAt;
        this.resolvedAt = resolvedAt;
    }

    public Long getId() {
        return id;
    }

    public Long getReporterId() {
        return reporterId;
    }

    public String getReporterName() {
        return reporterName;
    }

    public Long getReportedUserId() {
        return reportedUserId;
    }

    public String getReportedUserName() {
        return reportedUserName;
    }

    public String getReason() {
        return reason;
    }

    public String getDescription() {
        return description;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getResolvedAt() {
        return resolvedAt;
    }
}