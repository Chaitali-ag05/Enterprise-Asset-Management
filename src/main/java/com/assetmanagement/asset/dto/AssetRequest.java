package com.assetmanagement.asset.dto;

import com.assetmanagement.asset.enums.AssetCategory;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public record AssetRequest(

        @NotBlank(message = "Asset name is required.")
        String assetName,

        @NotBlank(message = "Serial number is required.")
        String serialNumber,

        @NotBlank(message = "Brand is required.")
        String brand,

        @NotBlank(message = "Model is required.")
        String model,

        String description,

        @NotNull(message = "Purchase date is required.")
        LocalDate purchaseDate,

        @NotNull(message = "Purchase cost is required.")
        @DecimalMin(value = "0.0", inclusive = false,
                message = "Purchase cost must be greater than zero.")
        BigDecimal purchaseCost,

        @NotNull(message = "Warranty expiry date is required.")
        LocalDate warrantyExpiry,

        @NotNull(message = "Asset category is required.")
        AssetCategory category,

        @NotNull(message = "Department is required.")
        Long departmentId,

        Long assignedEmployeeId,

        // vendorId is required for new assets (enforced in service).
        // It is intentionally excluded from update operations in the service layer.
        Long vendorId

) {}