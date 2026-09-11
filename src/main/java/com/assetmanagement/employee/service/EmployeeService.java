package com.assetmanagement.employee.service;

import com.assetmanagement.employee.dto.EmployeeRequest;
import com.assetmanagement.employee.dto.EmployeeResponse;

import java.util.List;

public interface EmployeeService {

    EmployeeResponse createEmployee(EmployeeRequest request);

    EmployeeResponse getEmployeeById(Long id);

    List<EmployeeResponse> getAllEmployees();

    EmployeeResponse updateEmployee(Long id, EmployeeRequest request);

    void deleteEmployee(Long id);
    
    EmployeeResponse getCurrentEmployee(String email);

    EmployeeResponse updateCurrentEmployee(String email, com.assetmanagement.employee.dto.EmployeeSelfUpdateRequest request);
}