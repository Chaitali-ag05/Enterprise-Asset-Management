package com.assetmanagement.maintenance.dto.request;

import com.assetmanagement.maintenance.enums.WorkOrderResponseAction;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RespondWorkOrderRequest(

        @NotNull(message = "Technician ID is required.")
        Long technicianId,

        @NotNull(message = "Action is required (ACCEPT or REJECT).")
        WorkOrderResponseAction action,

        /**
         * Required when action = REJECT.
         */
        @Size(max = 1000, message = "Rejection reason cannot exceed 1000 characters.")
        String rejectionReason

) {}
