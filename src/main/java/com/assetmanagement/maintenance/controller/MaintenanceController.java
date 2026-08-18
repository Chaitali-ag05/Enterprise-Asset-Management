package com.assetmanagement.maintenance.controller;

import com.assetmanagement.maintenance.dto.request.*;
import com.assetmanagement.maintenance.dto.response.MaintenanceHistoryResponse;
import com.assetmanagement.maintenance.dto.response.MaintenanceIssueResponse;
import com.assetmanagement.maintenance.dto.response.MaintenanceWorkOrderResponse;
import com.assetmanagement.maintenance.service.MaintenanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/maintenance")
@RequiredArgsConstructor
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    // ----------------------------------------------------------------
    // ISSUE ENDPOINTS
    // ----------------------------------------------------------------

    /**
     * POST /api/maintenance/issues
     * Employee reports a maintenance issue for an asset.
     */
    @PostMapping("/issues")
    public ResponseEntity<MaintenanceIssueResponse> reportIssue(
            @Valid @RequestBody ReportIssueRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(maintenanceService.reportIssue(request));
    }

    /**
     * GET /api/maintenance/issues
     * Get all maintenance issues.
     */
    @GetMapping("/issues")
    public ResponseEntity<List<MaintenanceIssueResponse>> getAllIssues() {
        return ResponseEntity.ok(maintenanceService.getAllIssues());
    }

    /**
     * GET /api/maintenance/issues/{id}
     * Get a single issue with full work order history.
     */
    @GetMapping("/issues/{id}")
    public ResponseEntity<MaintenanceIssueResponse> getIssueById(
            @PathVariable Long id) {

        return ResponseEntity.ok(maintenanceService.getIssueById(id));
    }

    /**
     * POST /api/maintenance/issues/{issueId}/work-orders
     * Manager assigns a technician to an issue, creating a new work order.
     */
    @PostMapping("/issues/{issueId}/work-orders")
    public ResponseEntity<MaintenanceWorkOrderResponse> createWorkOrder(
            @PathVariable Long issueId,
            @Valid @RequestBody AssignTechnicianRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(maintenanceService.createWorkOrder(issueId, request));
    }

    /**
     * POST /api/maintenance/issues/{issueId}/assign
     * Legacy/alias endpoint for manager assigning a technician.
     */
    @PostMapping("/issues/{issueId}/assign")
    public ResponseEntity<MaintenanceIssueResponse> assignTechnician(
            @PathVariable Long issueId,
            @Valid @RequestBody AssignTechnicianRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(maintenanceService.assignTechnician(issueId, request));
    }

    /**
     * GET /api/maintenance/issues/{issueId}/work-orders
     * Get all work order attempts for an issue.
     */
    @GetMapping("/issues/{issueId}/work-orders")
    public ResponseEntity<List<MaintenanceWorkOrderResponse>> getWorkOrdersByIssue(
            @PathVariable Long issueId) {

        return ResponseEntity.ok(maintenanceService.getWorkOrdersByIssue(issueId));
    }

    /**
     * PUT /api/maintenance/issues/{issueId}/decision
     * Manager makes a decision on a NOT_REPAIRABLE issue (RETIRE or REPLACE).
     */
    @PutMapping({"/issues/{issueId}/decision", "/issues/{issueId}/manager-decision"})
    public ResponseEntity<MaintenanceIssueResponse> applyManagerDecision(
            @PathVariable Long issueId,
            @Valid @RequestBody ManagerDecisionRequest request) {

        return ResponseEntity.ok(maintenanceService.applyManagerDecision(issueId, request));
    }

    // ----------------------------------------------------------------
    // WORK ORDER ENDPOINTS
    // ----------------------------------------------------------------

    /**
     * PUT /api/maintenance/work-orders/{workOrderId}/start
     * Technician starts the work order (status becomes IN_PROGRESS, Asset becomes UNDER_MAINTENANCE).
     */
    @PutMapping("/work-orders/{workOrderId}/start")
    public ResponseEntity<MaintenanceWorkOrderResponse> startWorkOrder(
            @PathVariable Long workOrderId) {

        return ResponseEntity.ok(maintenanceService.startWorkOrder(workOrderId));
    }

    /**
     * PUT /api/maintenance/work-orders/{workOrderId}/respond
     * Technician accepts or rejects the assigned work order.
     */
    @PutMapping("/work-orders/{workOrderId}/respond")
    public ResponseEntity<MaintenanceWorkOrderResponse> respondToWorkOrder(
            @PathVariable Long workOrderId,
            @Valid @RequestBody RespondWorkOrderRequest request) {

        return ResponseEntity.ok(maintenanceService.respondToWorkOrder(workOrderId, request));
    }

    /**
     * PUT /api/maintenance/work-orders/{workOrderId}/reject
     * Technician rejects the work order with a reason string.
     */
    @PutMapping("/work-orders/{workOrderId}/reject")
    public ResponseEntity<MaintenanceWorkOrderResponse> rejectWorkOrder(
            @PathVariable Long workOrderId,
            @RequestBody(required = false) RejectWorkOrderRequest request) {

        return ResponseEntity.ok(maintenanceService.rejectWorkOrder(workOrderId, request));
    }

    /**
     * PUT /api/maintenance/work-orders/{workOrderId}/complete
     * Technician submits repair completion.
     */
    @PutMapping("/work-orders/{workOrderId}/complete")
    public ResponseEntity<MaintenanceWorkOrderResponse> completeRepair(
            @PathVariable Long workOrderId,
            @RequestBody(required = false) CompleteRepairRequest request) {

        return ResponseEntity.ok(maintenanceService.completeRepair(workOrderId, request));
    }

    /**
     * PUT /api/maintenance/work-orders/{workOrderId}/not-repairable
     * Technician marks asset as NOT_REPAIRABLE with a reason string.
     */
    @PutMapping("/work-orders/{workOrderId}/not-repairable")
    public ResponseEntity<MaintenanceWorkOrderResponse> markNotRepairable(
            @PathVariable Long workOrderId,
            @RequestBody(required = false) NotRepairableRequest request) {

        return ResponseEntity.ok(maintenanceService.markNotRepairable(workOrderId, request));
    }

    /**
     * PUT /api/maintenance/work-orders/{workOrderId}/decision
     * Manager makes a decision on a NOT_REPAIRABLE work order (RETIRE or REPLACE).
     */
    @PutMapping("/work-orders/{workOrderId}/decision")
    public ResponseEntity<MaintenanceWorkOrderResponse> applyWorkOrderDecision(
            @PathVariable Long workOrderId,
            @Valid @RequestBody ManagerDecisionRequest request) {

        return ResponseEntity.ok(maintenanceService.applyWorkOrderDecision(workOrderId, request));
    }

    /**
     * GET /api/maintenance/work-orders/technician/{technicianId}
     * Get all work orders assigned to a specific technician.
     */
    @GetMapping("/work-orders/technician/{technicianId}")
    public ResponseEntity<List<MaintenanceWorkOrderResponse>> getWorkOrdersByTechnician(
            @PathVariable Long technicianId) {

        return ResponseEntity.ok(maintenanceService.getWorkOrdersByTechnician(technicianId));
    }

    // ----------------------------------------------------------------
    // HISTORY ENDPOINT
    // ----------------------------------------------------------------

    /**
     * GET /api/maintenance/assets/{assetId}/history
     * Get complete maintenance history for an asset.
     */
    @GetMapping("/assets/{assetId}/history")
    public ResponseEntity<MaintenanceHistoryResponse> getAssetMaintenanceHistory(
            @PathVariable Long assetId) {

        return ResponseEntity.ok(maintenanceService.getAssetMaintenanceHistory(assetId));
    }
}
