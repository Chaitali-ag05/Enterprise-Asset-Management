import type { AssetResponse } from "../../types/asset";

export type ReportTabId = "inventory" | "allocations" | "maintenance" | "lifecycle";

export interface InventoryFilters {
  department: string;
  category: string;
  vendor: string;
  status: string;
  warrantyStatus: string;
  search: string;
}

export interface AllocationsFilters {
  department: string;
  employee: string;
  category: string;
  status: string;
  search: string;
}

export interface MaintenanceFilters {
  department: string;
  category: string;
  technician: string;
  priority: string;
  status: string;
  search: string;
}

export interface LifecycleFilters {
  department: string;
  category: string;
  vendor: string;
  ageBand: string;
  status: string;
  search: string;
}

export type AgeBand = "0–<1 year" | "1–<3 years" | "3–<5 years" | "5+ years" | "Unknown";

export interface ReportSavedView {
  id: string;
  userId: string | number;
  tabId: ReportTabId;
  name: string;
  filters: Record<string, any>;
  createdAt: string;
}

export interface CustodyRecord {
  id: string | number;
  assignedTo: string;
  employeeId?: number;
  department: string;
  assetName: string;
  assetCode: string;
  category: string;
  assignedDate: string;
  status: string;
}

export interface MaintenanceReportItem {
  id: string | number;
  workOrderCode: string;
  assetName: string;
  assetCode: string;
  issueTitle: string;
  technicianName: string;
  priority: string;
  status: string;
  reportedAt: string;
  completedAt: string | null;
  departmentName?: string;
  category?: string;
}

export interface LifecycleAssetRecord extends AssetResponse {
  ageYears: number | null;
  ageBand: AgeBand;
}
