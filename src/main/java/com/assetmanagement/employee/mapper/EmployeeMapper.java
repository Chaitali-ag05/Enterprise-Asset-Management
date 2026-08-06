package com.assetmanagement.employee.mapper;

import com.assetmanagement.employee.dto.EmployeeResponse;
import com.assetmanagement.employee.entity.Employee.Employee;
import org.springframework.stereotype.Component;

@Component
public class EmployeeMapper {

    public EmployeeResponse toResponse(Employee employee) {

        return new EmployeeResponse(

                employee.getId(),

                employee.getEmployeeCode(),

                employee.getFirstName(),

                employee.getLastName(),

                employee.getEmail(),

                employee.getPhone(),

                employee.getDesignation(),

                employee.getStatus(),

                employee.getDepartment().getName(),

                employee.getManager() != null
                        ? employee.getManager().getEmployeeCode()
                        : null,

                employee.getManager() != null
                        ? employee.getManager().getFirstName() + " " + employee.getManager().getLastName()
                        : null
        );
    }
}