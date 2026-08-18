package com.assetmanagement.maintenance.dto.response;

import com.assetmanagement.maintenance.enums.WorkOrderStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record MaintenanceWorkOrderResponse(

        Long id,
        String workOrderCode,
        Long issueId,
        String issueCode,

        Long technicianId,
        String technicianName,

        Long assignedById,
        String assignedByName,

        String instructions,
        LocalDateTime assignedAt,

        WorkOrderStatus status,

        LocalDateTime acceptedAt,
        String rejectionReason,
        LocalDateTime startedAt,
        LocalDateTime completedAt,
        String resolutionNotes,
        Boolean isRepairable,
        String diagnosis,
        String actionTaken,
        String partsReplaced,
        BigDecimal repairCost,

        LocalDateTime createdAt,
        LocalDateTime updatedAt

) {}

