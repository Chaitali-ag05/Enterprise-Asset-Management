package com.assetmanagement.maintenance.entity;

import com.assetmanagement.common.entity.BaseEntity;
import com.assetmanagement.employee.entity.Employee.Employee;
import com.assetmanagement.maintenance.enums.WorkOrderStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "maintenance_work_orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceWorkOrder extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Auto-generated code in format WO0001, WO0002, ...
     */
    @Column(nullable = false, unique = true, updatable = false)
    private String workOrderCode;

    /**
     * The maintenance issue this work order belongs to.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maintenance_issue_id", nullable = false)
    private MaintenanceIssue maintenanceIssue;

    /**
     * The technician (Employee) assigned to this work order.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "technician_id", nullable = false)
    private Employee technician;

    /**
     * The manager (Employee) who assigned this work order.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_by_id", nullable = false)
    private Employee assignedBy;

    @Column(length = 2000)
    private String instructions;

    @Column(nullable = false)
    private LocalDateTime assignedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WorkOrderStatus status;

    // --- Technician response fields ---

    private LocalDateTime acceptedAt;

    /**
     * Filled when technician rejects the work order.
     */
    @Column(length = 1000)
    private String rejectionReason;

    // --- Work Order Progress fields ---

    private LocalDateTime startedAt;

    // --- Completion fields ---

    private LocalDateTime completedAt;

    @Column(length = 2000)
    private String resolutionNotes;

    /**
     * Whether the technician determined the asset is repairable.
     * null = not yet determined, true = repairable, false = not repairable.
     */
    private Boolean isRepairable;

    @Column(length = 2000)
    private String diagnosis;

    @Column(length = 2000)
    private String actionTaken;

    @Column(length = 1000)
    private String partsReplaced;

    @Column(precision = 12, scale = 2)
    private BigDecimal repairCost;
}

