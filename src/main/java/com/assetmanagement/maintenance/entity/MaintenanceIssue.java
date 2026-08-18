package com.assetmanagement.maintenance.entity;

import com.assetmanagement.asset.entity.Asset;
import com.assetmanagement.common.entity.BaseEntity;
import com.assetmanagement.employee.entity.Employee.Employee;
import com.assetmanagement.maintenance.enums.IssuePriority;
import com.assetmanagement.maintenance.enums.IssueStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "maintenance_issues")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceIssue extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Auto-generated code in format MNT0001, MNT0002, ...
     */
    @Column(nullable = false, unique = true, updatable = false)
    private String issueCode;

    /**
     * The asset that has the reported issue.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id", nullable = false)
    private Asset asset;

    /**
     * The employee who reported the issue.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reported_by_id", nullable = false)
    private Employee reportedBy;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private IssuePriority priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private IssueStatus status;

    @Column(nullable = false)
    private LocalDateTime reportedAt;

    private LocalDateTime resolvedAt;

    @Column(length = 2000)
    private String resolutionNotes;

    @OneToMany(mappedBy = "maintenanceIssue", cascade = CascadeType.ALL, orphanRemoval = false)
    @Builder.Default
    private List<MaintenanceWorkOrder> workOrders = new ArrayList<>();
}
