package com.assetmanagement.analytics.dto;

public record DashboardResponse(
        AssetSummary assets,
        EmployeeSummary employees,
        AssignmentSummary assignments,
        MaintenanceSummary maintenance
) {
    public record AssetSummary(
            long total,
            long available,
            long assigned,
            long underMaintenance,
            long retired
    ) {}

    public record EmployeeSummary(
            long total,
            long active,
            long inactive
    ) {}

    public record AssignmentSummary(
            long total,
            long active,
            long completed,
            long cancelled
    ) {}

    public record MaintenanceSummary(
            long totalIssues,
            long reportedOrUnderReview,
            long inProgress,
            long completed,
            long rejectedOrNotRepairable
    ) {}
}
