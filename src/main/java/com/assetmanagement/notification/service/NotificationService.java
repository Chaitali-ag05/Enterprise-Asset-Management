package com.assetmanagement.notification.service;

import com.assetmanagement.notification.dto.NotificationResponse;
import com.assetmanagement.notification.enums.NotificationType;

import java.util.List;

public interface NotificationService {

    /**
     * Create and persist a notification for a specific recipient (by employee ID).
     */
    void createNotification(Long recipientId, String title, String message,
                            NotificationType type, Long referenceId, String referenceType);

    /**
     * Retrieve all notifications for a given employee.
     */
    List<NotificationResponse> getNotificationsForEmployee(Long employeeId);

    /**
     * Retrieve only unread notifications for a given employee.
     */
    List<NotificationResponse> getUnreadNotificationsForEmployee(Long employeeId);

    /**
     * Count unread notifications for a given employee.
     */
    long countUnread(Long employeeId);

    /**
     * Mark a single notification as read.
     */
    NotificationResponse markAsRead(Long notificationId);

    /**
     * Mark all notifications as read for a given employee.
     */
    int markAllAsRead(Long employeeId);
}
