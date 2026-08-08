package com.assetmanagement.asset.assignment.dto;

import com.assetmanagement.asset.assignment.enums.AssignmentStatus;

import java.time.LocalDateTime;

public record AssignmentResponse(

        Long id,

        Long assetId,

        String assetCode,

        Long employeeId,

        String employeeName,

        Long departmentId,

        String departmentName,

        LocalDateTime assignedAt,

        AssignmentStatus assignmentStatus,

        LocalDateTime returnedAt,

        String remarks
) {
}