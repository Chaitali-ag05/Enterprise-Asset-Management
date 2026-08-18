package com.assetmanagement.vendor.dto;

import com.assetmanagement.vendor.enums.VendorStatus;

import java.time.LocalDateTime;

public record VendorResponse(

        Long id,
        String name,
        String contactPerson,
        String email,
        String phone,
        String address,
        VendorStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt

) {}
