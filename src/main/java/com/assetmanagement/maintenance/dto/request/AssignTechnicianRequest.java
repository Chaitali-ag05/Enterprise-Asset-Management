package com.assetmanagement.maintenance.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AssignTechnicianRequest(

        Long managerId,

        @NotNull(message = "Technician ID is required.")
        Long technicianId,

        @Size(max = 2000, message = "Instructions cannot exceed 2000 characters.")
        String instructions

) {}
