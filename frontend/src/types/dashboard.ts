export interface AssetSummary {
  total: number;
  available: number;
  assigned: number;
  underMaintenance: number;
  retired: number;
}

export interface EmployeeSummary {
  total: number;
  active: number;
  inactive: number;
}

export interface AssignmentSummary {
  total: number;
  active: number;
  completed: number;
  cancelled: number;
}

export interface MaintenanceSummary {
  totalIssues: number;
  reportedOrUnderReview: number;
  inProgress: number;
  completed: number;
  rejectedOrNotRepairable: number;
}

export interface DashboardResponse {
  assets: AssetSummary;
  employees: EmployeeSummary;
  assignments: AssignmentSummary;
  maintenance: MaintenanceSummary;
}
