package com.assetmanagement.config;

import com.assetmanagement.asset.entity.Asset;
import com.assetmanagement.asset.enums.AssetCategory;
import com.assetmanagement.asset.enums.AssetStatus;
import com.assetmanagement.asset.repository.AssetRepository;
import com.assetmanagement.auth.entity.Role;
import com.assetmanagement.auth.entity.User;
import com.assetmanagement.auth.repository.UserRepository;
import com.assetmanagement.department.entity.Department;
import com.assetmanagement.department.enums.DepartmentStatus;
import com.assetmanagement.department.repository.DepartmentRepository;
import com.assetmanagement.employee.entity.Designation;
import com.assetmanagement.employee.entity.Employee.Employee;
import com.assetmanagement.employee.entity.EmployeeStatus.EmployeeStatus;
import com.assetmanagement.employee.repository.EmployeeRepository;
import com.assetmanagement.maintenance.entity.MaintenanceIssue;
import com.assetmanagement.maintenance.entity.MaintenanceWorkOrder;
import com.assetmanagement.maintenance.enums.IssuePriority;
import com.assetmanagement.maintenance.enums.IssueStatus;
import com.assetmanagement.maintenance.enums.WorkOrderStatus;
import com.assetmanagement.maintenance.repository.MaintenanceIssueRepository;
import com.assetmanagement.maintenance.repository.MaintenanceWorkOrderRepository;
import com.assetmanagement.vendor.entity.Vendor;
import com.assetmanagement.vendor.enums.VendorStatus;
import com.assetmanagement.vendor.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class DefaultDataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;
    private final VendorRepository vendorRepository;
    private final AssetRepository assetRepository;
    private final MaintenanceIssueRepository maintenanceIssueRepository;
    private final MaintenanceWorkOrderRepository maintenanceWorkOrderRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        log.info("Checking default system seed data...");

        // 1. Department
        Department defaultDept = departmentRepository.findAll().stream().findFirst().orElseGet(() -> {
            Department d = new Department();
            d.setName("Information Technology");
            d.setStatus(DepartmentStatus.ACTIVE);
            return departmentRepository.save(d);
        });

        // 2. Vendor
        Vendor defaultVendor = vendorRepository.findAll().stream().findFirst().orElseGet(() -> {
            Vendor v = Vendor.builder()
                    .name("Dell Technologies")
                    .contactPerson("Michael Dell")
                    .email("support@dell.com")
                    .phone("555-0200")
                    .address("1 Dell Way, Round Rock, TX")
                    .status(VendorStatus.ACTIVE)
                    .build();
            return vendorRepository.save(v);
        });

        // 3. Default Users & Employees
        String encodedPassword = passwordEncoder.encode("password");

        // Admin
        ensureUser("admin", "admin@assetflow.com", encodedPassword, Role.ROLE_ADMIN);
        Employee adminEmp = ensureEmployee("admin@assetflow.com", "EMP1001", "System", "Admin", "555-0100", Designation.ADMIN, defaultDept, null);

        // Manager
        ensureUser("manager", "manager@assetflow.com", encodedPassword, Role.ROLE_MANAGER);
        Employee mgrEmp = ensureEmployee("manager@assetflow.com", "EMP1002", "Operations", "Manager", "555-0101", Designation.MANAGER, defaultDept, adminEmp);

        // Tech
        ensureUser("tech", "tech@assetflow.com", encodedPassword, Role.ROLE_TECHNICIAN);
        Employee techEmp = ensureEmployee("tech@assetflow.com", "EMP1003", "Lead", "Technician", "555-0102", Designation.SOFTWARE_ENGINEER, defaultDept, mgrEmp);

        // Employee
        ensureUser("employee", "employee@assetflow.com", encodedPassword, Role.ROLE_EMPLOYEE);
        Employee empEmp = ensureEmployee("employee@assetflow.com", "EMP1004", "John", "Employee", "555-0103", Designation.SOFTWARE_ENGINEER, defaultDept, mgrEmp);

        // 4. Default Assigned Asset for Employee
        Asset empAsset = assetRepository.findByAssignedEmployeeId(empEmp.getId()).stream().findFirst().orElseGet(() -> {
            Asset a = Asset.builder()
                    .assetCode("AST-DEMO-001")
                    .assetName("MacBook Pro 16\"")
                    .serialNumber("SN-EMP-DEMO-001")
                    .brand("Apple")
                    .model("M3 Pro 36GB")
                    .description("Standard employee workstation laptop.")
                    .purchaseDate(LocalDate.now().minusMonths(6))
                    .purchaseCost(new BigDecimal("2499.00"))
                    .warrantyExpiry(LocalDate.now().plusMonths(18))
                    .category(AssetCategory.LAPTOP)
                    .status(AssetStatus.ASSIGNED)
                    .department(defaultDept)
                    .vendor(defaultVendor)
                    .assignedEmployee(empEmp)
                    .build();
            return assetRepository.save(a);
        });

        // 5. Default Available Asset for Testing Assignments
        if (!assetRepository.existsBySerialNumber("SN-AVAIL-DEMO-002")) {
            Asset a = Asset.builder()
                    .assetCode("AST-DEMO-002")
                    .assetName("Dell UltraSharp 27\" 4K")
                    .serialNumber("SN-AVAIL-DEMO-002")
                    .brand("Dell")
                    .model("U2723QE")
                    .description("4K IPS USB-C Hub Monitor.")
                    .purchaseDate(LocalDate.now().minusMonths(3))
                    .purchaseCost(new BigDecimal("619.00"))
                    .warrantyExpiry(LocalDate.now().plusMonths(21))
                    .category(AssetCategory.MONITOR)
                    .status(AssetStatus.AVAILABLE)
                    .department(defaultDept)
                    .vendor(defaultVendor)
                    .build();
            assetRepository.save(a);
        }

        // 6. Default Maintenance Issue & Work Order for Tech
        if (maintenanceWorkOrderRepository.findByTechnicianIdOrderByAssignedAtDesc(techEmp.getId()).isEmpty()) {
            MaintenanceIssue issue = MaintenanceIssue.builder()
                    .issueCode("MNT9001")
                    .title("Keyboard key sticky")
                    .description("The spacebar key occasionally sticks when typing.")
                    .priority(IssuePriority.HIGH)
                    .status(IssueStatus.IN_PROGRESS)
                    .reportedAt(LocalDateTime.now().minusDays(1))
                    .reportedBy(empEmp)
                    .asset(empAsset)
                    .build();
            issue = maintenanceIssueRepository.save(issue);

            MaintenanceWorkOrder wo = MaintenanceWorkOrder.builder()
                    .workOrderCode("WO9001")
                    .maintenanceIssue(issue)
                    .technician(techEmp)
                    .assignedBy(mgrEmp)
                    .instructions("Clean the key switches and verify spring response.")
                    .assignedAt(LocalDateTime.now().minusHours(8))
                    .status(WorkOrderStatus.IN_PROGRESS)
                    .acceptedAt(LocalDateTime.now().minusHours(6))
                    .startedAt(LocalDateTime.now().minusHours(2))
                    .build();
            maintenanceWorkOrderRepository.save(wo);
        }

        log.info("Default system seed data initialized successfully.");
    }

    private User ensureUser(String username, String email, String encodedPassword, Role role) {
        User user = userRepository.findByUsernameOrEmail(username, email).orElse(null);
        if (user == null) {
            user = User.builder()
                    .username(username)
                    .email(email)
                    .password(encodedPassword)
                    .role(role)
                    .enabled(true)
                    .build();
            return userRepository.save(user);
        } else {
            user.setPassword(encodedPassword);
            user.setRole(role);
            user.setEnabled(true);
            return userRepository.save(user);
        }
    }

    private Employee ensureEmployee(String email, String employeeCode, String firstName, String lastName, String phone, Designation designation, Department dept, Employee manager) {
        return employeeRepository.findByEmail(email).orElseGet(() -> {
            Employee e = Employee.builder()
                    .employeeCode(employeeCode)
                    .firstName(firstName)
                    .lastName(lastName)
                    .email(email)
                    .phone(phone)
                    .designation(designation)
                    .status(EmployeeStatus.ACTIVE)
                    .department(dept)
                    .manager(manager)
                    .build();
            return employeeRepository.save(e);
        });
    }
}