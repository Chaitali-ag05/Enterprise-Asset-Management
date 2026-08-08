package com.assetmanagement.asset.assignment.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AssignmentRequest(

        @NotNull(message = "Employee ID is required")
        Long employeeId,

        @Size(max = 500, message = "Remarks cannot exceed 500 characters")
        String remarks
) {
}