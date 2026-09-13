export type VendorStatus = "ACTIVE" | "INACTIVE";

export interface VendorResponse {
  id: number;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  status: VendorStatus;
  createdAt: string;
  updatedAt: string;
}
