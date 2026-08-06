package com.assetmanagement.employee.service;

import com.assetmanagement.common.exception.BadRequestException;
import com.assetmanagement.common.exception.DuplicateResourceException;
import com.assetmanagement.common.exception.ResourceNotFoundException;
import com.assetmanagement.department.entity.Department;
import com.assetmanagement.department.repository.DepartmentRepository;
import com.assetmanagement.employee.dto.EmployeeRequest;
import com.assetmanagement.employee.dto.EmployeeResponse;
import com.assetmanagement.employee.entity.Employee.Employee;
import com.assetmanagement.employee.entity.EmployeeStatus.EmployeeStatus;
import com.assetmanagement.employee.mapper.EmployeeMapper;
import com.assetmanagement.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final EmployeeMapper employeeMapper;

    @Override
    public EmployeeResponse createEmployee(EmployeeRequest request) {

        if (employeeRepository.existsByEmail(request.email())) {
            throw new DuplicateResourceException("Email already exists.");
        }

        if (employeeRepository.existsByPhone(request.phone())) {
            throw new DuplicateResourceException("Phone number already exists.");
        }

        Department department = departmentRepository.findById(request.departmentId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Department not found."));

        Employee manager = null;

        if (request.managerId() != null) {
            manager = employeeRepository.findById(request.managerId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException("Manager not found."));
        }

        Employee employee = Employee.builder()
                .employeeCode(generateEmployeeCode())
                .firstName(request.firstName())
                .lastName(request.lastName())
                .email(request.email())
                .phone(request.phone())
                .designation(request.designation())
                .status(EmployeeStatus.ACTIVE)
                .department(department)
                .manager(manager)
                .build();

        employeeRepository.save(employee);

        return employeeMapper.toResponse(employee);
    }

    @Override
    @Transactional(readOnly = true)
    public EmployeeResponse getEmployeeById(Long id) {

        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Employee not found."));

        return employeeMapper.toResponse(employee);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmployeeResponse> getAllEmployees() {

        return employeeRepository.findByStatus(EmployeeStatus.ACTIVE)
                .stream()
                .map(employeeMapper::toResponse)
                .toList();
    }

    @Override
    public EmployeeResponse updateEmployee(Long id, EmployeeRequest request) {

        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Employee not found."));

        // Prevent updating inactive employees
        if (employee.getStatus() == EmployeeStatus.INACTIVE) {
            throw new BadRequestException("Inactive employees cannot be updated.");
        }

        if (employeeRepository.existsByEmailAndIdNot(request.email(), id)) {
            throw new DuplicateResourceException("Email already exists.");
        }

        if (employeeRepository.existsByPhoneAndIdNot(request.phone(), id)) {
            throw new DuplicateResourceException("Phone number already exists.");
        }

        Department department = departmentRepository.findById(request.departmentId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Department not found."));

        Employee manager = null;

        if (request.managerId() != null) {

            if (request.managerId().equals(id)) {
                throw new BadRequestException("Employee cannot be their own manager.");
            }

            manager = employeeRepository.findById(request.managerId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException("Manager not found."));

            if (manager.getStatus() == EmployeeStatus.INACTIVE) {
                throw new BadRequestException("Inactive employee cannot be assigned as manager.");
            }
        }

        employee.setFirstName(request.firstName());
        employee.setLastName(request.lastName());
        employee.setEmail(request.email());
        employee.setPhone(request.phone());
        employee.setDesignation(request.designation());
        employee.setDepartment(department);
        employee.setManager(manager);

        Employee updatedEmployee = employeeRepository.save(employee);

        return employeeMapper.toResponse(updatedEmployee);
    }
    @Override
    public void deleteEmployee(Long id) {

        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Employee not found."));

        employee.setStatus(EmployeeStatus.INACTIVE);

        employeeRepository.save(employee);
    }

    private String generateEmployeeCode() {

        return employeeRepository.findTopByOrderByIdDesc()
                .map(Employee::getEmployeeCode)
                .map(code -> {
                    int number = Integer.parseInt(((String) code).substring(3));
                    return String.format("EMP%04d", number + 1);
                })
                .orElse("EMP0001");
    }
}