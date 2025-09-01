package com.securemydocs.service;

import com.securemydocs.model.AuditLog;
import com.securemydocs.model.User;
import com.securemydocs.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AuditLogService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    public List<AuditLog> getLogsForCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        
        return auditLogRepository.findByUserEmailOrderByTimestampDesc(currentUsername);
    }

    public AuditLog createAuditLog(String action, String fileName) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        
        AuditLog auditLog = new AuditLog();
        auditLog.setAction(action);
        auditLog.setFileName(fileName);
        auditLog.setUser(currentUser);
        auditLog.setTimestamp(LocalDateTime.now());
        
        return auditLogRepository.save(auditLog);
    }

    // ADD THIS METHOD - it matches what PostServiceImplementation is calling
    public AuditLog saveLog(String action, String fileName, User user) {
        AuditLog auditLog = new AuditLog();
        auditLog.setAction(action);
        auditLog.setFileName(fileName);
        auditLog.setUser(user);
        auditLog.setTimestamp(LocalDateTime.now());
        
        return auditLogRepository.save(auditLog);
    }
}