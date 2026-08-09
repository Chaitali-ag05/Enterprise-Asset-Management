package com.assetmanagement.asset.assignment.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public record AssignmentRequest(

        @NotNull(message = "Employee ID is required")
        Long employeeId,

        LocalDate expectedReturnDate,

        String notes,

        @NotEmpty(message = "At least one asset is required")
        List<Long> assetIds
) {
}