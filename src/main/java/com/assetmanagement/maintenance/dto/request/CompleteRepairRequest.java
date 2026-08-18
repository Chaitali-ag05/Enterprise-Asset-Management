package com.assetmanagement.maintenance.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record CompleteRepairRequest(

        Long technicianId,

        Boolean isRepairable,

        @Size(max = 2000, message = "Resolution notes cannot exceed 2000 characters.")
        String resolutionNotes,

        @Size(max = 2000, message = "Diagnosis cannot exceed 2000 characters.")
        String diagnosis,

        @Size(max = 2000, message = "Action taken cannot exceed 2000 characters.")
        String actionTaken,

        @Size(max = 1000, message = "Parts replaced cannot exceed 1000 characters.")
        String partsReplaced,

        @DecimalMin(value = "0.0", inclusive = true,
                message = "Repair cost cannot be negative.")
        BigDecimal repairCost

) {}
