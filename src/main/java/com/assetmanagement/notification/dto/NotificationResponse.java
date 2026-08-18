package com.assetmanagement.notification.dto;

import com.assetmanagement.notification.enums.NotificationType;

import java.time.LocalDateTime;

public record NotificationResponse(
        Long id,
        Long recipientId,
        String title,
        String message,
        NotificationType type,
        Boolean isRead,
        Long referenceId,
        String referenceType,
        LocalDateTime createdAt
) {}
