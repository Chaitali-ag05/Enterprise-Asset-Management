package com.assetmanagement.notification.controller;

import com.assetmanagement.notification.dto.NotificationResponse;
import com.assetmanagement.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final com.assetmanagement.auth.service.IdentityService identityService;

    /**
     * GET /api/notifications/employee/{employeeId}
     * Retrieve all notifications for an employee.
     * ADMIN and MANAGER can access any employee's notifications.
     * EMPLOYEE and TECHNICIAN roles can only view (but cross-employee restriction
     * requires Userâ†”Employee link â€” tracked as a known design gap).
     */
    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE', 'TECHNICIAN')")
    public ResponseEntity<List<NotificationResponse>> getAllForEmployee(@PathVariable Long employeeId) {
        identityService.verifyEmployeeMatch(employeeId);
        return ResponseEntity.ok(notificationService.getNotificationsForEmployee(employeeId));
    }

    /**
     * GET /api/notifications/employee/{employeeId}/unread
     * Retrieve only unread notifications for an employee.
     */
    @GetMapping("/employee/{employeeId}/unread")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE', 'TECHNICIAN')")
    public ResponseEntity<List<NotificationResponse>> getUnreadForEmployee(@PathVariable Long employeeId) {
        identityService.verifyEmployeeMatch(employeeId);
        return ResponseEntity.ok(notificationService.getUnreadNotificationsForEmployee(employeeId));
    }

    /**
     * GET /api/notifications/employee/{employeeId}/count-unread
     * Count unread notifications for an employee.
     */
    @GetMapping("/employee/{employeeId}/count-unread")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE', 'TECHNICIAN')")
    public ResponseEntity<Map<String, Long>> countUnread(@PathVariable Long employeeId) {
        identityService.verifyEmployeeMatch(employeeId);
        long count = notificationService.countUnread(employeeId);
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    /**
     * PUT /api/notifications/{id}/read
     * Mark a single notification as read.
     */
    @PutMapping("/{id}/read")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE', 'TECHNICIAN')")
    public ResponseEntity<NotificationResponse> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }

    /**
     * PUT /api/notifications/employee/{employeeId}/read-all
     * Mark all notifications as read for an employee.
     */
    @PutMapping("/employee/{employeeId}/read-all")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE', 'TECHNICIAN')")
    public ResponseEntity<Map<String, Integer>> markAllAsRead(@PathVariable Long employeeId) {
        identityService.verifyEmployeeMatch(employeeId);
        int count = notificationService.markAllAsRead(employeeId);
        return ResponseEntity.ok(Map.of("markedRead", count));
    }
}


