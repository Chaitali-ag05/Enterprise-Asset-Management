export type IssueStatus =
  | "REPORTED"
  | "UNDER_REVIEW"
  | "IN_PROGRESS"
  | "REJECTED"
  | "COMPLETED"
  | "RESOLVED"
  | "NOT_REPAIRABLE"
  | "RESOLVED_RETIRED"
  | "RESOLVED_REPLACED";

export type WorkOrderStatus =
  | "ASSIGNED"
  | "PENDING_ACCEPTANCE"
  | "ACCEPTED"
  | "REJECTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "NOT_REPAIRABLE";

export type ManagerDecision = "RETIRE" | "REPLACE" | "APPROVE_REPAIR";
export type IssuePriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type WorkOrderResponseAction = "ACCEPT" | "REJECT";

export interface MaintenanceWorkOrderResponse {
  id: number;
  workOrderCode: string;
  issueId: number;
  issueCode: string;
  technicianId: number;
  technicianName: string;
  assignedById: number;
  assignedByName: string;
  instructions: string;
  assignedAt: string;
  status: WorkOrderStatus;
  acceptedAt: string | null;
  rejectionReason: string | null;
  startedAt: string | null;
  completedAt: string | null;
  resolutionNotes: string | null;
  isRepairable: boolean | null;
  diagnosis: string | null;
  actionTaken: string | null;
  partsReplaced: string | null;
  repairCost: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceIssueResponse {
  id: number;
  issueCode: string;
  assetId: number;
  assetCode: string;
  assetName: string;
  reportedById: number;
  reportedByName: string;
  title: string | null;
  description: string;
  priority: IssuePriority;
  status: IssueStatus;
  reportedAt: string;
  resolvedAt: string | null;
  resolutionNotes: string | null;
  workOrders: MaintenanceWorkOrderResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceHistoryResponse {
  assetId: number;
  assetCode: string;
  assetName: string;
  assetStatus: string;
  totalIssues: number;
  issues: MaintenanceIssueResponse[];
}

export interface ReportIssueRequest {
  assetId: number;
  reportedById: number;
  title?: string;
  description: string;
  priority: IssuePriority;
}

export interface AssignTechnicianRequest {
technicianId: number;
  instructions?: string;
}

export interface RespondWorkOrderRequest {
  action: WorkOrderResponseAction;
  rejectionReason?: string;
}

export interface RejectWorkOrderRequest {
  reason: string;
}

export interface CompleteRepairRequest {
  isRepairable: boolean;
  resolutionNotes?: string;
  diagnosis?: string;
  actionTaken?: string;
  partsReplaced?: string;
  repairCost?: number;
}

export interface NotRepairableRequest {
  reason: string;
}

export interface ManagerDecisionRequest {
decision: ManagerDecision;
  notes?: string;
}

