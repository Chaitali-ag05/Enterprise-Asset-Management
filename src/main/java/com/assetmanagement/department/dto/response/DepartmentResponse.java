package com.assetmanagement.department.dto.response;

import com.assetmanagement.department.enums.DepartmentStatus;

public record DepartmentResponse(
        Long id,
        String name,
        DepartmentStatus status
) {}