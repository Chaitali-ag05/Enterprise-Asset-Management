package com.assetmanagement.maintenance.service;

import com.assetmanagement.maintenance.dto.request.*;
import com.assetmanagement.maintenance.dto.response.MaintenanceHistoryResponse;
import com.assetmanagement.maintenance.dto.response.MaintenanceIssueResponse;
import com.assetmanagement.maintenance.dto.response.MaintenanceWorkOrderResponse;

import java.util.List;

public interface MaintenanceService {

    /** Employee reports a maintenance issue for an asset. */
    MaintenanceIssueResponse reportIssue(ReportIssueRequest request);

    /** Get a single issue with all its work order history. */
    MaintenanceIssueResponse getIssueById(Long issueId);

    /** Get all maintenance issues in the system. */
    List<MaintenanceIssueResponse> getAllIssues();

    /**
     * Manager assigns a technician to an issue.
     * Creates a new WorkOrder attempt.
     */
    MaintenanceWorkOrderResponse createWorkOrder(Long issueId, AssignTechnicianRequest request);

    /** Legacy alias for assignTechnician. */
    MaintenanceIssueResponse assignTechnician(Long issueId, AssignTechnicianRequest request);

    /** Technician starts the work order. Sets status = IN_PROGRESS and Asset status = UNDER_MAINTENANCE. */
    MaintenanceWorkOrderResponse startWorkOrder(Long workOrderId);

    /**
     * Technician accepts or rejects the assigned work order (full object response).
     */
    MaintenanceWorkOrderResponse respondToWorkOrder(Long workOrderId, RespondWorkOrderRequest request);

    /** Technician rejects the work order with a reason string. */
    MaintenanceWorkOrderResponse rejectWorkOrder(Long workOrderId, RejectWorkOrderRequest request);

    /**
     * Technician submits repair completion.
     */
    MaintenanceWorkOrderResponse completeRepair(Long workOrderId, CompleteRepairRequest request);

    /** Technician marks work order as NOT_REPAIRABLE with a reason. */
    MaintenanceWorkOrderResponse markNotRepairable(Long workOrderId, NotRepairableRequest request);

    /**
     * Manager decides on a NOT_REPAIRABLE work order (RETIRE or REPLACE).
     */
    MaintenanceWorkOrderResponse applyWorkOrderDecision(Long workOrderId, ManagerDecisionRequest request);

    /**
     * Manager decides on a NOT_REPAIRABLE issue (RETIRE or REPLACE).
     */
    MaintenanceIssueResponse applyManagerDecision(Long issueId, ManagerDecisionRequest request);

    /** Get all work orders for a specific issue. */
    List<MaintenanceWorkOrderResponse> getWorkOrdersByIssue(Long issueId);

    /** Get all work orders assigned to a specific technician. */
    List<MaintenanceWorkOrderResponse> getWorkOrdersByTechnician(Long technicianId);

    /** Get complete maintenance history for an asset. */
    MaintenanceHistoryResponse getAssetMaintenanceHistory(Long assetId);
}
