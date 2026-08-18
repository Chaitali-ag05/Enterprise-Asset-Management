package com.assetmanagement.analytics.service;

import com.assetmanagement.analytics.dto.DashboardResponse;
import com.assetmanagement.asset.enums.AssetStatus;
import com.assetmanagement.asset.assignment.enums.AssignmentStatus;
import com.assetmanagement.asset.assignment.repository.AssignmentRepository;
import com.assetmanagement.asset.repository.AssetRepository;
import com.assetmanagement.employee.entity.EmployeeStatus.EmployeeStatus;
import com.assetmanagement.employee.repository.EmployeeRepository;
import com.assetmanagement.maintenance.enums.IssueStatus;
import com.assetmanagement.maintenance.repository.MaintenanceIssueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyticsServiceImpl implements AnalyticsService {

    private final AssetRepository assetRepository;
    private final EmployeeRepository employeeRepository;
    private final AssignmentRepository assignmentRepository;
    private final MaintenanceIssueRepository maintenanceIssueRepository;

    @Override
    public DashboardResponse getDashboard() {
        return new DashboardResponse(
                buildAssetSummary(),
                buildEmployeeSummary(),
                buildAssignmentSummary(),
                buildMaintenanceSummary()
        );
    }

    private DashboardResponse.AssetSummary buildAssetSummary() {
        long total          = assetRepository.count();
        long available      = assetRepository.findByStatus(AssetStatus.AVAILABLE).size();
        long assigned       = assetRepository.findByStatus(AssetStatus.ASSIGNED).size();
        long underMaintenance = assetRepository.findByStatus(AssetStatus.UNDER_MAINTENANCE).size();
        long retired        = assetRepository.findByStatus(AssetStatus.RETIRED).size();
        return new DashboardResponse.AssetSummary(total, available, assigned, underMaintenance, retired);
    }

    private DashboardResponse.EmployeeSummary buildEmployeeSummary() {
        long total    = employeeRepository.count();
        long active   = employeeRepository.findByStatus(EmployeeStatus.ACTIVE).size();
        long inactive = employeeRepository.findByStatus(EmployeeStatus.INACTIVE).size();
        return new DashboardResponse.EmployeeSummary(total, active, inactive);
    }

    private DashboardResponse.AssignmentSummary buildAssignmentSummary() {
        long total     = assignmentRepository.count();
        // Count by status using in-memory stream — the repository is lean; add countByStatus if scale requires
        long active    = assignmentRepository.findAll().stream()
                            .filter(a -> a.getStatus() == AssignmentStatus.ACTIVE).count();
        long completed = assignmentRepository.findAll().stream()
                            .filter(a -> a.getStatus() == AssignmentStatus.COMPLETED).count();
        long cancelled = assignmentRepository.findAll().stream()
                            .filter(a -> a.getStatus() == AssignmentStatus.CANCELLED).count();
        return new DashboardResponse.AssignmentSummary(total, active, completed, cancelled);
    }

    private DashboardResponse.MaintenanceSummary buildMaintenanceSummary() {
        long total      = maintenanceIssueRepository.count();
        long reported   = maintenanceIssueRepository.findByStatus(IssueStatus.REPORTED).size()
                        + maintenanceIssueRepository.findByStatus(IssueStatus.UNDER_REVIEW).size();
        long inProgress = maintenanceIssueRepository.findByStatus(IssueStatus.IN_PROGRESS).size();
        long completed  = maintenanceIssueRepository.findByStatus(IssueStatus.COMPLETED).size()
                        + maintenanceIssueRepository.findByStatus(IssueStatus.RESOLVED).size()
                        + maintenanceIssueRepository.findByStatus(IssueStatus.RESOLVED_RETIRED).size()
                        + maintenanceIssueRepository.findByStatus(IssueStatus.RESOLVED_REPLACED).size();
        long rejected   = maintenanceIssueRepository.findByStatus(IssueStatus.REJECTED).size()
                        + maintenanceIssueRepository.findByStatus(IssueStatus.NOT_REPAIRABLE).size();
        return new DashboardResponse.MaintenanceSummary(total, reported, inProgress, completed, rejected);
    }
}
