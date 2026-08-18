package com.assetmanagement.maintenance.dto.response;

import com.assetmanagement.maintenance.enums.IssuePriority;
import com.assetmanagement.maintenance.enums.IssueStatus;

import java.time.LocalDateTime;
import java.util.List;

public record MaintenanceIssueResponse(

        Long id,
        String issueCode,

        Long assetId,
        String assetCode,
        String assetName,

        Long reportedById,
        String reportedByName,

        String title,
        String description,
        IssuePriority priority,
        IssueStatus status,

        LocalDateTime reportedAt,
        LocalDateTime resolvedAt,
        String resolutionNotes,

        List<MaintenanceWorkOrderResponse> workOrders,

        LocalDateTime createdAt,
        LocalDateTime updatedAt

) {}
