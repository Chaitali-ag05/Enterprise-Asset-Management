package com.assetmanagement.asset.assignment.service;

import com.assetmanagement.asset.assignment.dto.AssignmentRequest;
import com.assetmanagement.asset.assignment.dto.AssignmentResponse;
import com.assetmanagement.asset.assignment.entity.AssetAssignmentHistory;
import com.assetmanagement.asset.assignment.enums.AssignmentStatus;
import com.assetmanagement.asset.assignment.mapper.AssetAssignmentHistoryMapper;
import com.assetmanagement.asset.assignment.repository.AssetAssignmentHistoryRepository;
import com.assetmanagement.asset.entity.Asset;
import com.assetmanagement.asset.enums.AssetStatus;
import com.assetmanagement.asset.repository.AssetRepository;
import com.assetmanagement.common.exception.BadRequestException;
import com.assetmanagement.common.exception.ResourceNotFoundException;
import com.assetmanagement.employee.entity.Employee.Employee;
import com.assetmanagement.employee.entity.EmployeeStatus.EmployeeStatus;
import com.assetmanagement.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AssetAssignmentHistoryServiceImpl
        implements AssetAssignmentHistoryService {

    private final AssetAssignmentHistoryRepository assignmentHistoryRepository;
    private final AssetRepository assetRepository;
    private final EmployeeRepository employeeRepository;
    private final AssetAssignmentHistoryMapper assignmentHistoryMapper;

    @Override
    public AssignmentResponse assignAsset(
            Long assetId,
            AssignmentRequest request) {

        // 1. Find asset
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Asset not found."));

        // 2. Retired asset cannot be assigned
        if (asset.getStatus() == AssetStatus.RETIRED) {
            throw new BadRequestException(
                    "Retired assets cannot be assigned.");
        }

        // 3. Asset must not already be assigned
        if (asset.getStatus() == AssetStatus.ASSIGNED) {
            throw new BadRequestException(
                    "Asset is already assigned to an employee.");
        }

        // 4. Find employee
        Employee employee = employeeRepository.findById(request.employeeId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Employee not found."));

        // 5. Employee must be active
        if (employee.getStatus() != EmployeeStatus.ACTIVE) {
            throw new BadRequestException(
                    "Inactive employees cannot be assigned assets.");
        }

        // 6. Create assignment history
        AssetAssignmentHistory history =
                AssetAssignmentHistory.builder()
                        .asset(asset)
                        .employee(employee)

                        // Snapshot employee's department
                        .department(employee.getDepartment())

                        .assignedAt(LocalDateTime.now())
                        .assignmentStatus(AssignmentStatus.CURRENT)
                        .remarks(request.remarks())
                        .build();

        assignmentHistoryRepository.save(history);

        // 7. Update current state of asset
        asset.setAssignedEmployee(employee);
        asset.setStatus(AssetStatus.ASSIGNED);

        assetRepository.save(asset);

        return assignmentHistoryMapper.toResponse(history);
    }

    @Override
    public AssignmentResponse returnAsset(
            Long assetId,
            String remarks) {

        // 1. Find asset
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Asset not found."));

        // 2. Find current assignment
        AssetAssignmentHistory history =
                assignmentHistoryRepository
                        .findByAssetAndAssignmentStatus(
                                asset,
                                AssignmentStatus.CURRENT
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "No current assignment found for this asset."
                                ));

        // 3. Close assignment
        history.setAssignmentStatus(AssignmentStatus.RETURNED);
        history.setReturnedAt(LocalDateTime.now());

        if (remarks != null && !remarks.isBlank()) {
            history.setRemarks(remarks);
        }

        assignmentHistoryRepository.save(history);

        // 4. Update asset
        asset.setAssignedEmployee(null);
        asset.setStatus(AssetStatus.AVAILABLE);

        assetRepository.save(asset);

        return assignmentHistoryMapper.toResponse(history);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssignmentResponse> getAssetHistory(
            Long assetId) {

        // Verify asset exists
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Asset not found."));

        return assignmentHistoryRepository
                .findByAssetOrderByAssignedAtDesc(asset)
                .stream()
                .map(assignmentHistoryMapper::toResponse)
                .toList();
    }
}