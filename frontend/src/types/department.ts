export type DepartmentStatus = "ACTIVE" | "INACTIVE";

export interface DepartmentResponse {
  id: number;
  name: string;
  status: DepartmentStatus;
}
