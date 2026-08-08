package com.assetmanagement.asset.assignment.entity;

import com.assetmanagement.asset.assignment.enums.AssignmentStatus;
import com.assetmanagement.asset.entity.Asset;
import com.assetmanagement.common.entity.BaseEntity;
import com.assetmanagement.department.entity.Department;
import com.assetmanagement.employee.entity.Employee.Employee;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "asset_assignment_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssetAssignmentHistory extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id", nullable = false)
    private Asset asset;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    // Department of the employee at the time of assignment
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Column(nullable = false)
    private LocalDateTime assignedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AssignmentStatus assignmentStatus;

    private LocalDateTime returnedAt;

    @Column(length = 500)
    private String remarks;
}