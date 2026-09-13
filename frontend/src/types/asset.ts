export type AssetStatus = "AVAILABLE" | "ASSIGNED" | "UNDER_MAINTENANCE" | "RETIRED";

export type AssetCategory = "LAPTOP" | "DESKTOP" | "MONITOR" | "PRINTER" | "MOBILE" | "TABLET" | "NETWORK_DEVICE" | "OTHER";

export interface AssetResponse {
  id: number;
  assetCode: string;
  assetName: string;
  serialNumber: string;
  brand: string;
  model: string;
  description: string;
  purchaseDate: string; // ISO date string
  purchaseCost: number;
  warrantyExpiry: string; // ISO date string
  status: AssetStatus;
  category: AssetCategory;
  departmentId: number;
  departmentName: string;
  assignedEmployeeId: number | null;
  assignedEmployeeName: string | null;
  vendorId: number;
  vendorName: string;
}

export interface AssetRequest {
  assetName: string;
  serialNumber: string;
  brand: string;
  model: string;
  description?: string;
  purchaseDate: string;
  purchaseCost: number;
  warrantyExpiry: string;
  category: AssetCategory;
  departmentId: number;
  assignedEmployeeId?: number | null;
  vendorId?: number; // Required for create, excluded for update
}
