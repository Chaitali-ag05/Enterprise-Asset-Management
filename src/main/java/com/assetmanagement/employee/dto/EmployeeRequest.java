package com.assetmanagement.employee.dto;

import com.assetmanagement.employee.entity.Designation;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record EmployeeRequest(

        @NotBlank(message = "First name is required")
        String firstName,

        @NotBlank(message = "Last name is required")
        String lastName,

        @Email(message = "Invalid email")
        @NotBlank(message = "Email is required")
        String email,

        @NotBlank(message = "Phone number is required")
        String phone,

        @NotNull(message = "Designation is required")
        Designation designation,

        @NotNull(message = "Department is required")
        Long departmentId,

        Long managerId

) {
}