package com.securemydocs.repository;

import com.securemydocs.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    // Use email instead of username if that's what your User entity has
    List<AuditLog> findByUserEmailOrderByTimestampDesc(String email);
    
    // OR if you want to use the user ID
    List<AuditLog> findByUserIdOrderByTimestampDesc(Long userId);
}