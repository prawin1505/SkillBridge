package com.skillbridge.repository;

import com.skillbridge.entity.UserReport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserReportRepository extends JpaRepository<UserReport, Long> {

    List<UserReport> findAllByOrderByCreatedAtDesc();

    List<UserReport> findByReporterIdOrderByCreatedAtDesc(Long reporterId);

    List<UserReport> findByStatusOrderByCreatedAtDesc(String status);
    long countByStatus(String status);
}