package com.assetmanagement.department.service;

import com.assetmanagement.department.dto.request.DepartmentRequest;
import com.assetmanagement.department.dto.response.DepartmentResponse;

import java.util.List;

public interface DepartmentService {

    DepartmentResponse createDepartment(DepartmentRequest request);

    List<DepartmentResponse> getAllDepartments();

    DepartmentResponse getDepartmentById(Long id);

    DepartmentResponse updateDepartment(Long id, DepartmentRequest request);

    void deactivateDepartment(Long id);
}