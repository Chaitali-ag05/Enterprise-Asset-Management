package com.assetmanagement.employee.dto;

import com.assetmanagement.employee.entity.Designation;
import com.assetmanagement.employee.entity.EmployeeStatus.EmployeeStatus;

public record EmployeeResponse(

        Long id,
        String employeeCode,
        String firstName,
        String lastName,
        String email,
        String phone,
        Designation designation,
        EmployeeStatus status,
        String departmentName,
        String managerCode,
        String managerName

) {}