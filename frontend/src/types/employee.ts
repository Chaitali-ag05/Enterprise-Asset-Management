export type Designation = "INTERN" | "SOFTWARE_ENGINEER" | "SENIOR_SOFTWARE_ENGINEER" | "TEAM_LEAD" | "MANAGER" | "HR" | "ADMIN";
export type EmployeeStatus = "ACTIVE" | "INACTIVE";

export interface EmployeeResponse {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  designation: Designation;
  status: EmployeeStatus;
  departmentName: string;
  managerCode: string | null;
  managerName: string | null;
}

export interface EmployeeRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  designation: Designation;
  departmentId: number;
  managerId?: number | null;
}
