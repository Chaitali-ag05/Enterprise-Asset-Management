package com.assetmanagement.employee.repository;

import com.assetmanagement.employee.entity.Employee.Employee;
import com.assetmanagement.employee.entity.EmployeeStatus.EmployeeStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);

    boolean existsByEmployeeCode(String employeeCode);

    Optional<Employee> findByEmployeeCode(String employeeCode);

    boolean existsByEmailAndIdNot(String email, Long id);

    boolean existsByPhoneAndIdNot(String phone, Long id);

    Optional<Employee> findTopByOrderByIdDesc();

    Optional<Employee> findByIdAndStatus(Long id, EmployeeStatus status);

    List<Employee> findByStatus(EmployeeStatus status);
}