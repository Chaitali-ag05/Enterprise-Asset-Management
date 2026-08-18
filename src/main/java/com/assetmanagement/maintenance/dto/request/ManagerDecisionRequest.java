package com.assetmanagement.maintenance.dto.request;

import com.assetmanagement.maintenance.enums.ManagerDecision;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ManagerDecisionRequest(

        Long managerId,

        @NotNull(message = "Decision is required (RETIRE or REPLACE).")
        ManagerDecision decision,

        @Size(max = 2000, message = "Notes cannot exceed 2000 characters.")
        String notes

) {}
