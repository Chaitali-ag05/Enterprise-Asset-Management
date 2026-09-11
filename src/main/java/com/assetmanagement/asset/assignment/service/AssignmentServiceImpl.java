package com.assetmanagement.asset.assignment.service;

import com.assetmanagement.asset.assignment.dto.AssignmentItemResponse;
import com.assetmanagement.asset.assignment.dto.AssignmentRequest;
import com.assetmanagement.asset.assignment.dto.AssignmentResponse;
import com.assetmanagement.asset.assignment.entity.Assignment;
import com.assetmanagement.asset.assignment.entity.AssignmentItem;
import com.assetmanagement.asset.assignment.enums.AssignmentItemStatus;
import com.assetmanagement.asset.assignment.enums.AssignmentStatus;
import com.assetmanagement.asset.assignment.mapper.AssignmentMapper;
import com.assetmanagement.asset.assignment.repository.AssignmentItemRepository;
import com.assetmanagement.asset.assignment.repository.AssignmentRepository;
import com.assetmanagement.asset.entity.Asset;
import com.assetmanagement.asset.enums.AssetStatus;
import com.assetmanagement.asset.repository.AssetRepository;
import com.assetmanagement.common.exception.BadRequestException;
import com.assetmanagement.common.exception.ResourceNotFoundException;
import com.assetmanagement.department.entity.Department;
import com.assetmanagement.employee.entity.Employee.Employee;
import com.assetmanagement.employee.entity.EmployeeStatus.EmployeeStatus;
import com.assetmanagement.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AssignmentServiceImpl implements AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final AssignmentItemRepository assignmentItemRepository;
    private final EmployeeRepository employeeRepository;
    private final AssetRepository assetRepository;
    private final AssignmentMapper assignmentMapper;
    private final com.assetmanagement.auth.service.IdentityService identityService;

    @Override
    public AssignmentResponse createAssignment(AssignmentRequest request) {
        // STEP 1: Find Employee
        Employee employee = employeeRepository.findById(request.employeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found."));

        // STEP 2: Verify Employee is ACTIVE
        if (employee.getStatus() != EmployeeStatus.ACTIVE) {
            throw new BadRequestException("Inactive employees cannot be assigned assets.");
        }

        // STEP 3: Read employee's current department (Historical Snapshot)
        Department department = employee.getDepartment();

        // STEP 4: Validate assetIds is not empty
        if (request.assetIds() == null || request.assetIds().isEmpty()) {
            throw new BadRequestException("At least one asset is required.");
        }

        // STEP 5 & 6: Pre-validate all assets before mutating any entities or state
        List<Asset> assetsToAssign = new ArrayList<>();
        for (Long assetId : request.assetIds()) {
            Asset asset = assetRepository.findById(assetId)
                    .orElseThrow(() -> new ResourceNotFoundException("Asset not found."));

            if (asset.getStatus() == AssetStatus.RETIRED) {
                throw new BadRequestException("Retired assets cannot be assigned.");
            }
            if (asset.getStatus() == AssetStatus.UNDER_MAINTENANCE) {
                throw new BadRequestException("Assets under maintenance cannot be assigned.");
            }

            if (asset.getStatus() == AssetStatus.ASSIGNED) {
                throw new BadRequestException("Asset is already assigned to an employee.");
            }

            assetsToAssign.add(asset);
        }

        // STEP 7: Create Assignment header
        Assignment assignment = Assignment.builder()
                .employee(employee)
                .department(department)
                .assignedAt(LocalDateTime.now())
                .expectedReturnDate(request.expectedReturnDate())
                .status(AssignmentStatus.ACTIVE)
                .notes(request.notes())
                .items(new ArrayList<>())
                .build();

        // STEP 8: Create AssignmentItem for each validated asset
        for (Asset asset : assetsToAssign) {
            AssignmentItem item = AssignmentItem.builder()
                    .assignment(assignment)
                    .asset(asset)
                    .status(AssignmentItemStatus.ASSIGNED)
                    .returnedAt(null)
                    .remarks(null)
                    .build();

            assignment.getItems().add(item);

            // STEP 9: Update Asset live state
            asset.setAssignedEmployee(employee);
            asset.setStatus(AssetStatus.ASSIGNED);
        }

        // STEP 10: Save Assignment (cascades items via CascadeType.ALL)
        Assignment savedAssignment = assignmentRepository.save(assignment);

        // STEP 11: Return Response
        return assignmentMapper.toResponse(savedAssignment);
    }

    @Override
    @Transactional(readOnly = true)
    public AssignmentResponse getAssignmentById(Long id) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found."));
        identityService.verifyEmployeeMatch(assignment.getEmployee().getId());
        return assignmentMapper.toResponse(assignment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssignmentResponse> getAllAssignments() {
        return assignmentRepository.findAll().stream()
                .map(assignmentMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssignmentResponse> getAssignmentsByEmployeeId(Long employeeId) {
        return assignmentRepository.findByEmployeeIdOrderByIdDesc(employeeId).stream()
                .map(assignmentMapper::toResponse)
                .toList();
    }

    @Override
    public AssignmentResponse returnAssignmentItem(Long assignmentId, Long itemId, String remarks) {
        // STEP 1: Find Assignment
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found."));
                
        // Fix IDOR #2: Verify ownership
        identityService.verifyEmployeeMatch(assignment.getEmployee().getId());

        // STEP 2: Find AssignmentItem
        AssignmentItem item = assignmentItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment item not found."));

        // STEP 3: Verify item belongs to Assignment
        if (!item.getAssignment().getId().equals(assignmentId)) {
            throw new BadRequestException("Assignment item does not belong to this assignment.");
        }

        // STEP 4: Verify item status is ASSIGNED
        if (item.getStatus() == AssignmentItemStatus.RETURNED) {
            throw new BadRequestException("Asset has already been returned.");
        }

        // STEP 5: Update item
        item.setStatus(AssignmentItemStatus.RETURNED);
        item.setReturnedAt(LocalDateTime.now());
        if (remarks != null && !remarks.isBlank()) {
            item.setRemarks(remarks);
        }

        // STEP 6: Update Asset live state
        Asset asset = item.getAsset();
        if (asset != null) {
            asset.setAssignedEmployee(null);
            if (asset.getStatus() == AssetStatus.ASSIGNED) {
                asset.setStatus(AssetStatus.AVAILABLE);
            }
        }

        // STEP 7: Check auto-completion (all items returned)
        boolean allReturned = assignment.getItems().stream()
                .allMatch(i -> i.getStatus() == AssignmentItemStatus.RETURNED);

        if (allReturned) {
            assignment.setStatus(AssignmentStatus.COMPLETED);
        } else {
            assignment.setStatus(AssignmentStatus.ACTIVE);
        }

        // STEP 8: Save Assignment
        Assignment savedAssignment = assignmentRepository.save(assignment);

        // STEP 9: Return Response
        return assignmentMapper.toResponse(savedAssignment);
    }

    @Override
    public void autoCloseAssetAssignment(Long assetId, String reason) {
        Asset asset = assetRepository.findById(assetId).orElse(null);
        if (asset == null) return;
        
        assignmentItemRepository.findByAssetAndStatus(asset, com.assetmanagement.asset.assignment.enums.AssignmentItemStatus.ASSIGNED)
            .ifPresent(item -> {
                item.setStatus(com.assetmanagement.asset.assignment.enums.AssignmentItemStatus.RETURNED);
                item.setReturnedAt(java.time.LocalDateTime.now());
                item.setRemarks(reason);
                assignmentItemRepository.save(item);
                
                Assignment assignment = item.getAssignment();
                boolean allReturned = assignment.getItems().stream()
                        .allMatch(i -> i.getStatus() == com.assetmanagement.asset.assignment.enums.AssignmentItemStatus.RETURNED);
        
                if (allReturned) {
                    assignment.setStatus(com.assetmanagement.asset.assignment.enums.AssignmentStatus.COMPLETED);
                    assignmentRepository.save(assignment);
                }
            });
    }
    @Override
    public List<AssignmentItemResponse> getAssignmentItems(Long assignmentId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found."));
        identityService.verifyEmployeeMatch(assignment.getEmployee().getId());

        return assignmentItemRepository.findByAssignmentOrderByIdAsc(assignment).stream()
                .map(assignmentMapper::toItemResponse)
                .toList();
    }
}






