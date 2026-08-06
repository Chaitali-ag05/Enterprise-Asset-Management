package com.assetmanagement.department.mapper;

import com.assetmanagement.department.dto.request.DepartmentRequest;
import com.assetmanagement.department.dto.response.DepartmentResponse;
import com.assetmanagement.department.entity.Department;
import org.springframework.stereotype.Component;

@Component
public class DepartmentMapper {

    public Department toEntity(DepartmentRequest request) {
        Department department = new Department();
        department.setName(request.name());
        return department;
    }

    public DepartmentResponse toResponse(Department department) {
        return new DepartmentResponse(
                department.getId(),
                department.getName(),
                department.getStatus()
        );
    }
}