export type AssignmentStatus = "ACTIVE" | "COMPLETED" | "CANCELLED";
export type AssignmentItemStatus = "ASSIGNED" | "RETURNED" | "LOST" | "DAMAGED";

export interface AssignmentItemResponse {
  id: number;
  assetId: number;
  assetCode: string;
  assetName: string;
  status: AssignmentItemStatus;
  returnedAt: string | null;
  remarks: string | null;
}

export interface AssignmentResponse {
  id: number;
  employeeId: number;
  employeeName: string;
  currentDepartmentId: number;
  currentDepartmentName: string;
  assignedDepartmentId: number;
  assignedDepartmentName: string;
  assignedAt: string;
  expectedReturnDate: string | null;
  status: AssignmentStatus;
  notes: string | null;
  items: AssignmentItemResponse[];
}

export interface AssignmentRequest {
  employeeId: number;
  expectedReturnDate: string | null;
  notes: string | null;
  assetIds: number[];
}

