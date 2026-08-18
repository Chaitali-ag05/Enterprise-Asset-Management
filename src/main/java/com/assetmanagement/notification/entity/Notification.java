package com.assetmanagement.notification.entity;

import com.assetmanagement.common.entity.BaseEntity;
import com.assetmanagement.notification.enums.NotificationType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The employee ID this notification is addressed to
    @Column(name = "recipient_id", nullable = false)
    private Long recipientId;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, length = 500)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private NotificationType type;

    @Builder.Default
    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;

    // Optional: ID of the related entity (e.g. assignmentId, issueId)
    @Column(name = "reference_id")
    private Long referenceId;

    // Optional: name of the related entity type (e.g. "Assignment", "MaintenanceIssue")
    @Column(name = "reference_type", length = 50)
    private String referenceType;
}
