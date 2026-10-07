package com.skillbridge.service;

import com.skillbridge.dto.UserReportRequest;
import com.skillbridge.dto.UserReportResponse;
import com.skillbridge.entity.User;
import com.skillbridge.entity.UserReport;
import com.skillbridge.repository.UserReportRepository;
import com.skillbridge.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserReportService {

    private final UserReportRepository userReportRepository;
    private final UserRepository userRepository;

    public UserReportService(
            UserReportRepository userReportRepository,
            UserRepository userRepository) {

        this.userReportRepository = userReportRepository;
        this.userRepository = userRepository;
    }

    // Create a report
    public UserReportResponse createReport(
            User reporter,
            UserReportRequest request) {

        if (reporter.getId().equals(request.getReportedUserId())) {
            throw new RuntimeException("You cannot report yourself");
        }

        User reportedUser = userRepository
                .findById(request.getReportedUserId())
                .orElseThrow(() ->
                        new RuntimeException("Reported user not found"));

        UserReport report = new UserReport();

        report.setReporter(reporter);
        report.setReportedUser(reportedUser);
        report.setReason(request.getReason());
        report.setDescription(request.getDescription());
        report.setStatus("PENDING");

        UserReport saved = userReportRepository.save(report);

        return convertToResponse(saved);
    }

    // Get all reports - Admin
    public List<UserReportResponse> getAllReports() {

        return userReportRepository
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // Get current user's reports
    public List<UserReportResponse> getMyReports(User reporter) {

        return userReportRepository
                .findByReporterIdOrderByCreatedAtDesc(reporter.getId())
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // Resolve report - Admin
    public UserReportResponse resolveReport(Long reportId) {

        UserReport report = userReportRepository
                .findById(reportId)
                .orElseThrow(() ->
                        new RuntimeException("Report not found"));

        report.setStatus("RESOLVED");
        report.setResolvedAt(LocalDateTime.now());

        UserReport saved = userReportRepository.save(report);

        return convertToResponse(saved);
    }

    // Dismiss report - Admin
    public UserReportResponse dismissReport(Long reportId) {

        UserReport report = userReportRepository
                .findById(reportId)
                .orElseThrow(() ->
                        new RuntimeException("Report not found"));

        report.setStatus("DISMISSED");
        report.setResolvedAt(LocalDateTime.now());

        UserReport saved = userReportRepository.save(report);

        return convertToResponse(saved);
    }

    // Convert Entity → DTO
    private UserReportResponse convertToResponse(UserReport report) {

        User reporter = report.getReporter();
        User reportedUser = report.getReportedUser();

        String reporterName =
                reporter.getFirstName() + " " + reporter.getLastName();

        String reportedUserName =
                reportedUser.getFirstName() + " "
                        + reportedUser.getLastName();

        return new UserReportResponse(
                report.getId(),
                reporter.getId(),
                reporterName,
                reportedUser.getId(),
                reportedUserName,
                report.getReason(),
                report.getDescription(),
                report.getStatus(),
                report.getCreatedAt(),
                report.getResolvedAt()
        );
    }
}