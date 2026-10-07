package com.skillbridge.dto;

public class AdminAnalyticsResponse {

    private long totalUsers;
    private long activeUsers;
    private long inactiveUsers;
    private long adminUsers;
    private long normalUsers;

    private long totalConnections;
    private long totalReports;
    private long pendingReports;
    private long resolvedReports;
    private long dismissedReports;

    public AdminAnalyticsResponse(
            long totalUsers,
            long activeUsers,
            long inactiveUsers,
            long adminUsers,
            long normalUsers,
            long totalConnections,
            long totalReports,
            long pendingReports,
            long resolvedReports,
            long dismissedReports) {

        this.totalUsers = totalUsers;
        this.activeUsers = activeUsers;
        this.inactiveUsers = inactiveUsers;
        this.adminUsers = adminUsers;
        this.normalUsers = normalUsers;
        this.totalConnections = totalConnections;
        this.totalReports = totalReports;
        this.pendingReports = pendingReports;
        this.resolvedReports = resolvedReports;
        this.dismissedReports = dismissedReports;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public long getActiveUsers() {
        return activeUsers;
    }

    public long getInactiveUsers() {
        return inactiveUsers;
    }

    public long getAdminUsers() {
        return adminUsers;
    }

    public long getNormalUsers() {
        return normalUsers;
    }

    public long getTotalConnections() {
        return totalConnections;
    }

    public long getTotalReports() {
        return totalReports;
    }

    public long getPendingReports() {
        return pendingReports;
    }

    public long getResolvedReports() {
        return resolvedReports;
    }

    public long getDismissedReports() {
        return dismissedReports;
    }
}