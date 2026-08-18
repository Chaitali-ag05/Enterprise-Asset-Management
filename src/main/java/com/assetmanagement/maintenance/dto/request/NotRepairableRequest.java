package com.assetmanagement.maintenance.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record NotRepairableRequest(

        @NotBlank(message = "Reason is required when marking asset as not repairable.")
        @Size(max = 2000, message = "Reason cannot exceed 2000 characters.")
        String reason

) {}
