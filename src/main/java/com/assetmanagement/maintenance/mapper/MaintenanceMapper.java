package com.assetmanagement.maintenance.mapper;

import com.assetmanagement.maintenance.dto.response.MaintenanceIssueResponse;
import com.assetmanagement.maintenance.dto.response.MaintenanceWorkOrderResponse;
import com.assetmanagement.maintenance.entity.MaintenanceIssue;
import com.assetmanagement.maintenance.entity.MaintenanceWorkOrder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class MaintenanceMapper {

    public MaintenanceWorkOrderResponse toWorkOrderResponse(MaintenanceWorkOrder wo) {
        return new MaintenanceWorkOrderResponse(
                wo.getId(),
                wo.getWorkOrderCode(),
                wo.getMaintenanceIssue().getId(),
                wo.getMaintenanceIssue().getIssueCode(),

                wo.getTechnician().getId(),
                wo.getTechnician().getFirstName() + " " + wo.getTechnician().getLastName(),

                wo.getAssignedBy().getId(),
                wo.getAssignedBy().getFirstName() + " " + wo.getAssignedBy().getLastName(),

                wo.getInstructions(),
                wo.getAssignedAt(),
                wo.getStatus(),
                wo.getAcceptedAt(),
                wo.getRejectionReason(),
                wo.getStartedAt(),
                wo.getCompletedAt(),
                wo.getResolutionNotes(),
                wo.getIsRepairable(),
                wo.getDiagnosis(),
                wo.getActionTaken(),
                wo.getPartsReplaced(),
                wo.getRepairCost(),
                wo.getCreatedAt(),
                wo.getUpdatedAt()
        );
    }


    public MaintenanceIssueResponse toIssueResponse(MaintenanceIssue issue) {
        List<MaintenanceWorkOrderResponse> workOrders = issue.getWorkOrders()
                .stream()
                .map(this::toWorkOrderResponse)
                .toList();

        return new MaintenanceIssueResponse(
                issue.getId(),
                issue.getIssueCode(),

                issue.getAsset().getId(),
                issue.getAsset().getAssetCode(),
                issue.getAsset().getAssetName(),

                issue.getReportedBy().getId(),
                issue.getReportedBy().getFirstName() + " " + issue.getReportedBy().getLastName(),

                issue.getTitle(),
                issue.getDescription(),
                issue.getPriority(),
                issue.getStatus(),

                issue.getReportedAt(),
                issue.getResolvedAt(),
                issue.getResolutionNotes(),

                workOrders,

                issue.getCreatedAt(),
                issue.getUpdatedAt()
        );
    }
}
