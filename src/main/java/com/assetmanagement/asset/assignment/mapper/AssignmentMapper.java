package com.assetmanagement.asset.assignment.mapper;

import com.assetmanagement.asset.assignment.dto.AssignmentItemResponse;
import com.assetmanagement.asset.assignment.dto.AssignmentResponse;
import com.assetmanagement.asset.assignment.entity.Assignment;
import com.assetmanagement.asset.assignment.entity.AssignmentItem;
import com.assetmanagement.employee.entity.Employee.Employee;
import com.assetmanagement.department.entity.Department;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Component
public class AssignmentMapper {

    public AssignmentResponse toResponse(Assignment assignment) {
        if (assignment == null) {
            return null;
        }

        Employee employee = assignment.getEmployee();

        String employeeName = employee != null
                ? employee.getFirstName() + " " + employee.getLastName()
                : null;

        Long employeeId = employee != null
                ? employee.getId()
                : null;

        // CURRENT department of the employee
        Department currentDepartment = employee != null
                ? employee.getDepartment()
                : null;

        Long currentDepartmentId = currentDepartment != null
                ? currentDepartment.getId()
                : null;

        String currentDepartmentName = currentDepartment != null
                ? currentDepartment.getName()
                : null;

        // HISTORICAL department stored when assignment was created
        Department assignedDepartment = assignment.getDepartment();

        Long assignedDepartmentId = assignedDepartment != null
                ? assignedDepartment.getId()
                : null;

        String assignedDepartmentName = assignedDepartment != null
                ? assignedDepartment.getName()
                : null;

        List<AssignmentItemResponse> itemResponses = assignment.getItems() != null
                ? assignment.getItems()
                .stream()
                .map(this::toItemResponse)
                .toList()
                : Collections.emptyList();

        return new AssignmentResponse(
                assignment.getId(),
                employeeId,
                employeeName,

                currentDepartmentId,
                currentDepartmentName,

                assignedDepartmentId,
                assignedDepartmentName,

                assignment.getAssignedAt(),
                assignment.getExpectedReturnDate(),
                assignment.getStatus(),
                assignment.getNotes(),
                itemResponses
        );
    }

    public AssignmentItemResponse toItemResponse(AssignmentItem item) {
        if (item == null) {
            return null;
        }

        Long assetId = item.getAsset() != null
                ? item.getAsset().getId()
                : null;

        String assetCode = item.getAsset() != null
                ? item.getAsset().getAssetCode()
                : null;

        String assetName = item.getAsset() != null
                ? item.getAsset().getAssetName()
                : null;

        return new AssignmentItemResponse(
                item.getId(),
                assetId,
                assetCode,
                assetName,
                item.getStatus(),
                item.getReturnedAt(),
                item.getRemarks()
        );
    }
}