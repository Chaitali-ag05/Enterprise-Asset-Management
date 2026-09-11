package com.assetmanagement.notification.service;

import com.assetmanagement.common.exception.ResourceNotFoundException;
import com.assetmanagement.notification.dto.NotificationResponse;
import com.assetmanagement.notification.entity.Notification;
import com.assetmanagement.notification.enums.NotificationType;
import com.assetmanagement.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class NotificationServiceImpl implements NotificationService {
    private final com.assetmanagement.auth.service.IdentityService identityService;

    private final NotificationRepository notificationRepository;

    @Override
    public void createNotification(Long recipientId, String title, String message,
                                   NotificationType type, Long referenceId, String referenceType) {
        Notification notification = Notification.builder()
                .recipientId(recipientId)
                .title(title)
                .message(message)
                .type(type)
                .referenceId(referenceId)
                .referenceType(referenceType)
                .isRead(false)
                .build();

        notificationRepository.save(notification);
        log.debug("Notification created for recipientId={} type={}", recipientId, type);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getNotificationsForEmployee(Long employeeId) {
        return notificationRepository
                .findByRecipientIdOrderByCreatedAtDesc(employeeId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getUnreadNotificationsForEmployee(Long employeeId) {
        return notificationRepository
                .findByRecipientIdAndIsReadFalseOrderByCreatedAtDesc(employeeId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public long countUnread(Long employeeId) {
        return notificationRepository.countByRecipientIdAndIsReadFalse(employeeId);
    }

    @Override
    public NotificationResponse markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));
        identityService.verifyEmployeeMatch(notification.getRecipientId());
        notification.setIsRead(true);
        return toResponse(notificationRepository.save(notification));
    }

    @Override
    public int markAllAsRead(Long employeeId) {
        return notificationRepository.markAllReadByRecipientId(employeeId);
    }

    private NotificationResponse toResponse(Notification n) {
        return new NotificationResponse(
                n.getId(),
                n.getRecipientId(),
                n.getTitle(),
                n.getMessage(),
                n.getType(),
                n.getIsRead(),
                n.getReferenceId(),
                n.getReferenceType(),
                n.getCreatedAt()
        );
    }
}


