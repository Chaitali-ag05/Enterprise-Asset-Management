package com.assetmanagement.maintenance.service;

import com.assetmanagement.asset.entity.Asset;
import com.assetmanagement.asset.enums.AssetStatus;
import com.assetmanagement.asset.repository.AssetRepository;
import com.assetmanagement.common.exception.BadRequestException;
import com.assetmanagement.common.exception.ResourceNotFoundException;
import com.assetmanagement.employee.entity.Employee.Employee;
import com.assetmanagement.employee.entity.EmployeeStatus.EmployeeStatus;
import com.assetmanagement.employee.repository.EmployeeRepository;
import com.assetmanagement.maintenance.dto.request.*;
import com.assetmanagement.maintenance.dto.response.MaintenanceHistoryResponse;
import com.assetmanagement.maintenance.dto.response.MaintenanceIssueResponse;
import com.assetmanagement.maintenance.dto.response.MaintenanceWorkOrderResponse;
import com.assetmanagement.maintenance.entity.MaintenanceIssue;
import com.assetmanagement.maintenance.entity.MaintenanceWorkOrder;
import com.assetmanagement.maintenance.enums.*;
import com.assetmanagement.maintenance.mapper.MaintenanceMapper;
import com.assetmanagement.maintenance.repository.MaintenanceIssueRepository;
import com.assetmanagement.maintenance.repository.MaintenanceWorkOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class MaintenanceServiceImpl implements MaintenanceService {

    private final MaintenanceIssueRepository issueRepository;
    private final MaintenanceWorkOrderRepository workOrderRepository;
    private final AssetRepository assetRepository;
    private final EmployeeRepository employeeRepository;
    private final MaintenanceMapper mapper;
    private final com.assetmanagement.auth.service.IdentityService identityService;
    private final com.assetmanagement.asset.assignment.service.AssignmentService assignmentService;

    // ========================================================================
    // 1. REPORT ISSUE
    // ========================================================================

    @Override
    public MaintenanceIssueResponse reportIssue(ReportIssueRequest request) {

        Asset asset = assetRepository.findById(request.assetId())
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found."));

        if (asset.getStatus() == AssetStatus.RETIRED) {
            throw new BadRequestException("Cannot report a maintenance issue for a retired asset.");
        }

        if (asset.getStatus() == AssetStatus.UNDER_MAINTENANCE) {
            throw new BadRequestException(
                    "Asset already has an open maintenance issue. Resolve the existing issue first.");
        }

        Employee reporter = identityService.getCurrentEmployee();
        
        // ADMIN/MANAGER can report for any asset. Otherwise, must be assigned to them.
        boolean isAdminOrManager = identityService.hasAnyRole("ADMIN", "MANAGER");
        
        if (!isAdminOrManager && asset.getAssignedEmployee() != null 
                && !asset.getAssignedEmployee().getId().equals(reporter.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("Access denied. You can only report issues for assets assigned to you.");
        }
        
        if (isAdminOrManager && request.getReporterId() != null) {
            reporter = employeeRepository.findById(request.getReporterId()).orElse(reporter);
        }

        String title = (request.title() != null && !request.title().isBlank())
                ? request.title()
                : "Maintenance Issue for Asset #" + asset.getId();

        MaintenanceIssue issue = MaintenanceIssue.builder()
                .issueCode(generateIssueCode())
                .asset(asset)
                .reportedBy(reporter)
                .title(title)
                .description(request.description())
                .priority(request.priority())
                .status(IssueStatus.REPORTED)
                .reportedAt(LocalDateTime.now())
                .build();

        MaintenanceIssue saved = issueRepository.save(issue);
        return mapper.toIssueResponse(saved);
    }

    // ========================================================================
    // 2. GET ISSUE BY ID & ALL ISSUES
    // ========================================================================

    @Override
    @Transactional(readOnly = true)
    public MaintenanceIssueResponse getIssueById(Long issueId) {
        MaintenanceIssue issue = getIssue(issueId);
        return mapper.toIssueResponse(issue);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MaintenanceIssueResponse> getAllIssues() {
        return issueRepository.findAll()
                .stream()
                .map(mapper::toIssueResponse)
                .toList();
    }

    // ========================================================================
    // 3. CREATE WORK ORDER / ASSIGN TECHNICIAN (Manager action)
    // ========================================================================

    @Override
    public MaintenanceWorkOrderResponse createWorkOrder(Long issueId, AssignTechnicianRequest request) {
        MaintenanceIssue issue = getIssue(issueId);

        if (issue.getStatus() == IssueStatus.COMPLETED
                || issue.getStatus() == IssueStatus.RESOLVED
                || issue.getStatus() == IssueStatus.RESOLVED_RETIRED
                || issue.getStatus() == IssueStatus.RESOLVED_REPLACED) {
            throw new BadRequestException("Cannot assign a technician to a closed issue.");
        }

        boolean hasActiveWorkOrder = workOrderRepository.findByMaintenanceIssueIdOrderByIdAsc(issueId).stream()
                .anyMatch(wo -> wo.getStatus() == WorkOrderStatus.ASSIGNED 
                             || wo.getStatus() == WorkOrderStatus.PENDING_ACCEPTANCE 
                             || wo.getStatus() == WorkOrderStatus.ACCEPTED 
                             || wo.getStatus() == WorkOrderStatus.IN_PROGRESS);
        if (hasActiveWorkOrder) {
            throw new BadRequestException("Issue already has an active work order.");
        }

        // Validate technician
        Employee technician = employeeRepository.findById(request.technicianId())
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found."));

        if (technician.getStatus() != EmployeeStatus.ACTIVE) {
            throw new BadRequestException("Technician is not active.");
        }

        // Set the assignedBy manager from the authenticated identity
        Employee manager = identityService.getCurrentEmployee();

        MaintenanceWorkOrder workOrder = MaintenanceWorkOrder.builder()
                .workOrderCode(generateWorkOrderCode())
                .maintenanceIssue(issue)
                .technician(technician)
                .assignedBy(manager)
                .instructions(request.instructions())
                .assignedAt(LocalDateTime.now())
                .status(WorkOrderStatus.PENDING_ACCEPTANCE)
                .build();

        issue.getWorkOrders().add(workOrder);
        issue.setStatus(IssueStatus.UNDER_REVIEW);

        workOrderRepository.save(workOrder);
        issueRepository.save(issue);
        return mapper.toWorkOrderResponse(workOrder);
    }

    @Override
    public MaintenanceIssueResponse assignTechnician(Long issueId, AssignTechnicianRequest request) {
        createWorkOrder(issueId, request);
        return mapper.toIssueResponse(getIssue(issueId));
    }

    // ========================================================================
    // 4. START WORK ORDER (Technician action)
    // ========================================================================

    @Override
    public MaintenanceWorkOrderResponse startWorkOrder(Long workOrderId) {
        MaintenanceWorkOrder workOrder = getWorkOrder(workOrderId);

        if (workOrder.getStatus() == WorkOrderStatus.REJECTED
                || workOrder.getStatus() == WorkOrderStatus.COMPLETED
                || workOrder.getStatus() == WorkOrderStatus.NOT_REPAIRABLE) {
            throw new BadRequestException("Cannot start a work order with status: " + workOrder.getStatus());
        }

        if (workOrder.getStatus() == WorkOrderStatus.IN_PROGRESS) {
            throw new BadRequestException("Work order is already in progress.");
        }

        MaintenanceIssue issue = workOrder.getMaintenanceIssue();
        Asset asset = issue.getAsset();

        workOrder.setStatus(WorkOrderStatus.IN_PROGRESS);
        workOrder.setStartedAt(LocalDateTime.now());

        // Update asset live status to UNDER_MAINTENANCE (assignedEmployee retained)
        asset.setStatus(AssetStatus.UNDER_MAINTENANCE);

        issue.setStatus(IssueStatus.IN_PROGRESS);

        assetRepository.save(asset);
        issueRepository.save(issue);
        MaintenanceWorkOrder saved = workOrderRepository.save(workOrder);
        return mapper.toWorkOrderResponse(saved);
    }

    // ========================================================================
    // 5. RESPOND & REJECT WORK ORDER
    // ========================================================================

    @Override
    public MaintenanceWorkOrderResponse respondToWorkOrder(Long workOrderId, RespondWorkOrderRequest request) {
        if (request.action() == WorkOrderResponseAction.ACCEPT) {
            MaintenanceWorkOrder workOrder = getWorkOrder(workOrderId);
            if (workOrder.getStatus() != WorkOrderStatus.PENDING_ACCEPTANCE && workOrder.getStatus() != WorkOrderStatus.ASSIGNED) {
                throw new BadRequestException("Cannot accept work order with status: " + workOrder.getStatus());
            }
            workOrder.setStatus(WorkOrderStatus.ACCEPTED);
            workOrder.setAcceptedAt(LocalDateTime.now());
            MaintenanceWorkOrder saved = workOrderRepository.save(workOrder);
            return mapper.toWorkOrderResponse(saved);
        } else {
            return rejectWorkOrder(workOrderId, new RejectWorkOrderRequest(request.rejectionReason()));
        }
    }

    @Override
    public MaintenanceWorkOrderResponse rejectWorkOrder(Long workOrderId, RejectWorkOrderRequest request) {
        MaintenanceWorkOrder workOrder = getWorkOrder(workOrderId);

        if (request == null || request.reason() == null || request.reason().trim().isEmpty()) {
            throw new BadRequestException("Rejection reason is required.");
        }

        if (workOrder.getStatus() == WorkOrderStatus.COMPLETED
                || workOrder.getStatus() == WorkOrderStatus.NOT_REPAIRABLE) {
            throw new BadRequestException("Cannot reject a completed or not-repairable work order.");
        }

        workOrder.setStatus(WorkOrderStatus.REJECTED);
        workOrder.setRejectionReason(request.reason().trim());

        MaintenanceIssue issue = workOrder.getMaintenanceIssue();
        issue.setStatus(IssueStatus.REJECTED);

        issueRepository.save(issue);
        MaintenanceWorkOrder saved = workOrderRepository.save(workOrder);
        return mapper.toWorkOrderResponse(saved);
    }

    // ========================================================================
    // 6. COMPLETE REPAIR
    // ========================================================================

    @Override
    public MaintenanceWorkOrderResponse completeRepair(Long workOrderId, CompleteRepairRequest request) {
        MaintenanceWorkOrder workOrder = getWorkOrder(workOrderId);

        if (workOrder.getStatus() == WorkOrderStatus.REJECTED) {
            throw new BadRequestException("Rejected work order cannot be completed.");
        }

        if (workOrder.getStatus() == WorkOrderStatus.COMPLETED) {
            throw new BadRequestException("Work order is already completed.");
        }

        if (workOrder.getStartedAt() == null) {
            workOrder.setStartedAt(LocalDateTime.now());
        }

        String notes = request != null && request.resolutionNotes() != null
                ? request.resolutionNotes()
                : (request != null && request.actionTaken() != null ? request.actionTaken() : "Repair completed successfully.");

        workOrder.setStatus(WorkOrderStatus.COMPLETED);
        workOrder.setCompletedAt(LocalDateTime.now());
        workOrder.setResolutionNotes(notes);
        if (request != null) {
            workOrder.setDiagnosis(request.diagnosis());
            workOrder.setActionTaken(request.actionTaken());
            workOrder.setPartsReplaced(request.partsReplaced());
            workOrder.setRepairCost(request.repairCost());
            workOrder.setIsRepairable(request.isRepairable() != null ? request.isRepairable() : true);
        }

        MaintenanceIssue issue = workOrder.getMaintenanceIssue();
        issue.setStatus(IssueStatus.COMPLETED);
        issue.setResolvedAt(LocalDateTime.now());
        issue.setResolutionNotes(notes);

        Asset asset = issue.getAsset();
        // Restore asset status: if assigned to employee, revert to ASSIGNED, else AVAILABLE
        if (asset.getAssignedEmployee() != null) {
            asset.setStatus(AssetStatus.ASSIGNED);
        } else {
            asset.setStatus(AssetStatus.AVAILABLE);
        }

        assetRepository.save(asset);
        issueRepository.save(issue);
        MaintenanceWorkOrder saved = workOrderRepository.save(workOrder);
        return mapper.toWorkOrderResponse(saved);
    }

    // ========================================================================
    // 7. MARK NOT REPAIRABLE
    // ========================================================================

    @Override
    public MaintenanceWorkOrderResponse markNotRepairable(Long workOrderId, NotRepairableRequest request) {
        MaintenanceWorkOrder workOrder = getWorkOrder(workOrderId);

        if (request == null || request.reason() == null || request.reason().trim().isEmpty()) {
            throw new BadRequestException("Reason is required when marking asset as not repairable.");
        }

        if (workOrder.getStatus() == WorkOrderStatus.COMPLETED
                || workOrder.getStatus() == WorkOrderStatus.REJECTED
                || workOrder.getStatus() == WorkOrderStatus.NOT_REPAIRABLE) {
            throw new BadRequestException("Cannot mark a " + workOrder.getStatus() + " work order as NOT_REPAIRABLE.");
        }

        workOrder.setStatus(WorkOrderStatus.NOT_REPAIRABLE);
        workOrder.setRejectionReason(request.reason().trim());
        workOrder.setIsRepairable(false);

        MaintenanceIssue issue = workOrder.getMaintenanceIssue();
        issue.setStatus(IssueStatus.NOT_REPAIRABLE);

        // Asset status remains UNDER_MAINTENANCE until manager decides
        issueRepository.save(issue);
        MaintenanceWorkOrder saved = workOrderRepository.save(workOrder);
        return mapper.toWorkOrderResponse(saved);
    }

    // ========================================================================
    // 8. MANAGER DECISION (on NOT_REPAIRABLE)
    // ========================================================================

    @Override
    public MaintenanceWorkOrderResponse applyWorkOrderDecision(Long workOrderId, ManagerDecisionRequest request) {
        MaintenanceWorkOrder workOrder = getWorkOrder(workOrderId);

        if (request.decision() == ManagerDecision.APPROVE_REPAIR) {
            if (workOrder.getStatus() != WorkOrderStatus.COMPLETED) {
                throw new BadRequestException("Manager can only approve repairs for COMPLETED work orders. Current: " + workOrder.getStatus());
            }
        } else {
            if (workOrder.getStatus() != WorkOrderStatus.NOT_REPAIRABLE) {
                throw new BadRequestException("Manager decision " + request.decision() + " can only be applied when status is NOT_REPAIRABLE. Current: " + workOrder.getStatus());
            }
        }

        applyManagerDecision(workOrder.getMaintenanceIssue().getId(), request);
        return mapper.toWorkOrderResponse(getWorkOrder(workOrderId));
    }

    @Override
    public MaintenanceIssueResponse applyManagerDecision(Long issueId, ManagerDecisionRequest request) {
        MaintenanceIssue issue = getIssue(issueId);

        if (request.decision() == ManagerDecision.APPROVE_REPAIR) {
            if (issue.getStatus() != IssueStatus.COMPLETED) {
                throw new BadRequestException("Manager can only approve repairs for COMPLETED issues. Current: " + issue.getStatus());
            }
        } else {
            if (issue.getStatus() != IssueStatus.NOT_REPAIRABLE) {
                throw new BadRequestException("Manager decision " + request.decision() + " can only be applied to NOT_REPAIRABLE issues. Current: " + issue.getStatus());
            }
        }

        Asset asset = issue.getAsset();

        if (request.decision() == ManagerDecision.APPROVE_REPAIR) {
            issue.setStatus(IssueStatus.RESOLVED);
            // Asset is already ASSIGNED or AVAILABLE from the completeRepair step, but we can affirm it.
            if (request.notes() != null && !request.notes().isBlank()) {
                issue.setResolutionNotes(issue.getResolutionNotes() + " | Manager Notes: " + request.notes());
            }
        } else if (request.decision() == ManagerDecision.RETIRE) {
            asset.setAssignedEmployee(null);
            asset.setStatus(AssetStatus.RETIRED);
            issue.setStatus(IssueStatus.RESOLVED_RETIRED);
            assignmentService.autoCloseAssetAssignment(asset.getId(), "Asset RETIRED via maintenance decision.");
            issue.setResolvedAt(LocalDateTime.now());
            issue.setResolutionNotes("Asset RETIRED by manager."
                    + (request.notes() != null ? " Notes: " + request.notes() : ""));
        } else {
            asset.setAssignedEmployee(null);
            asset.setStatus(AssetStatus.RETIRED);
            issue.setStatus(IssueStatus.RESOLVED_REPLACED);
            assignmentService.autoCloseAssetAssignment(asset.getId(), "Asset flagged for REPLACEMENT via maintenance decision.");
            issue.setResolvedAt(LocalDateTime.now());
            issue.setResolutionNotes("Asset flagged for REPLACEMENT by manager."
                    + (request.notes() != null ? " Notes: " + request.notes() : ""));
        }

        assetRepository.save(asset);
        MaintenanceIssue saved = issueRepository.save(issue);
        return mapper.toIssueResponse(saved);
    }

    // ========================================================================
    // 9. LOOKUPS & HISTORY
    // ========================================================================

    @Override
    @Transactional(readOnly = true)
    public List<MaintenanceWorkOrderResponse> getWorkOrdersByIssue(Long issueId) {
        MaintenanceIssue issue = getIssue(issueId);
        return workOrderRepository.findByMaintenanceIssueIdOrderByIdAsc(issue.getId())
                .stream()
                .map(mapper::toWorkOrderResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<MaintenanceWorkOrderResponse> getWorkOrdersByTechnician(Long technicianId) {
        return workOrderRepository.findByTechnicianIdOrderByAssignedAtDesc(technicianId)
                .stream()
                .map(mapper::toWorkOrderResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public MaintenanceHistoryResponse getAssetMaintenanceHistory(Long assetId) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found."));

        List<MaintenanceIssueResponse> issues = issueRepository
                .findByAssetIdWithWorkOrdersOrderByReportedAtDesc(assetId)
                .stream()
                .map(mapper::toIssueResponse)
                .toList();

        return new MaintenanceHistoryResponse(
                asset.getId(),
                asset.getAssetCode(),
                asset.getAssetName(),
                asset.getStatus().name(),
                issues.size(),
                issues
        );
    }

    // ========================================================================
    // PRIVATE HELPERS
    // ========================================================================

    private MaintenanceIssue getIssue(Long issueId) {
        return issueRepository.findById(issueId)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance issue not found."));
    }

    private MaintenanceWorkOrder getWorkOrder(Long workOrderId) {
        MaintenanceWorkOrder workOrder = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("Work order not found."));
        // Fix IDOR #3: Verify Technician Ownership
        identityService.verifyTechnicianMatch(workOrder.getTechnician().getId());
        return workOrder;
    }

    private Employee getActiveEmployee(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found."));

        if (employee.getStatus() != EmployeeStatus.ACTIVE) {
            throw new BadRequestException(
                    "Employee is not active: " + employee.getFirstName() + " " + employee.getLastName());
        }
        return employee;
    }

    private String generateIssueCode() {
        MaintenanceIssue last = issueRepository.findTopByOrderByIdDesc().orElse(null);
        if (last == null || last.getIssueCode() == null) {
            return "MNT0001";
        }
        String lastCode = last.getIssueCode();
        try {
            if (lastCode.startsWith("MNT") && lastCode.length() > 3) {
                int num = Integer.parseInt(lastCode.substring(3));
                return String.format("MNT%04d", num + 1);
            }
        } catch (NumberFormatException ignored) {
        }
        return "MNT" + String.format("%04d", (last.getId() != null ? last.getId() + 1 : 1));
    }

    private String generateWorkOrderCode() {
        // Only consider codes that match the WO#### format generated by this service.
        // Codes inserted directly in tests (e.g. TWO0001_123) are ignored via fallback.
        Optional<MaintenanceWorkOrder> last = workOrderRepository.findTopByWorkOrderCodeStartingWithOrderByIdDesc("WO");
        if (last.isEmpty()) {
            return "WO0001";
        }
        String lastCode = last.get().getWorkOrderCode();
        try {
            int num = Integer.parseInt(lastCode.substring(2));
            return String.format("WO%04d", num + 1);
        } catch (NumberFormatException e) {
            // Fallback: count all work orders and use count+1
            long count = workOrderRepository.count();
            return String.format("WO%04d", count + 1);
        }
    }
    @Override
    public List<MaintenanceIssueResponse> getIssuesByReporter(Long employeeId) {
        return issueRepository.findAll().stream()
                .filter(issue -> issue.getReportedBy() != null && issue.getReportedBy().getId().equals(employeeId))
                .map(mapper::toIssueResponse)
                .collect(java.util.stream.Collectors.toList());
    }
}