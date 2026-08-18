package com.assetmanagement.asset.dto;

import com.assetmanagement.asset.enums.AssetCategory;
import com.assetmanagement.asset.enums.AssetStatus;

import java.math.BigDecimal;
import java.time.LocalDate;

public record AssetResponse(

        Long id,

        String assetCode,

        String assetName,

        String serialNumber,

        String brand,

        String model,

        String description,

        LocalDate purchaseDate,

        BigDecimal purchaseCost,

        LocalDate warrantyExpiry,

        AssetStatus status,

        AssetCategory category,

        Long departmentId,

        String departmentName,

        Long assignedEmployeeId,

        String assignedEmployeeName,

        Long vendorId,

        String vendorName

) {}