package com.assetmanagement.asset.assignment.dto;

import com.assetmanagement.asset.assignment.dto.AssignmentItemResponse;
import com.assetmanagement.asset.assignment.enums.AssignmentStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record AssignmentResponse(
        Long id,
        Long employeeId,
        String employeeName,
        Long currentDepartmentId,
        String currentDepartmentName,
        Long assignedDepartmentId,
        String assignedDepartmentName,
        LocalDateTime assignedAt,
        LocalDate expectedReturnDate,
        AssignmentStatus status,
        String notes,
        List<AssignmentItemResponse> items
) {
}