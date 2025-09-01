package com.securemydocs.controller;

import com.securemydocs.model.AuditLog;
import com.securemydocs.service.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/audit-logs")
public class AuditLogController {

    @Autowired
    private AuditLogService auditLogService;

    // Get audit logs for current user only
    @GetMapping("/current-user")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<AuditLog>> getCurrentUserAuditLogs() {
        List<AuditLog> logs = auditLogService.getLogsForCurrentUser();
        return ResponseEntity.ok(logs);
    }

    // Create audit log (automatically associates with current user)
    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<AuditLog> createAuditLog(@RequestBody Map<String, String> request) {
        String action = request.get("action");
        String fileName = request.get("fileName");
        
        AuditLog createdLog = auditLogService.createAuditLog(action, fileName);
        return ResponseEntity.ok(createdLog);
    }
    
    // Alternative: Create audit log with explicit parameters
    @PostMapping("/create")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<AuditLog> createAuditLog(
            @RequestParam String action,
            @RequestParam String fileName) {
        AuditLog createdLog = auditLogService.createAuditLog(action, fileName);
        return ResponseEntity.ok(createdLog);
    }
}