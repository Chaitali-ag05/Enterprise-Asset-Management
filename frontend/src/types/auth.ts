export type Role = "ROLE_ADMIN" | "ROLE_MANAGER" | "ROLE_TECHNICIAN" | "ROLE_EMPLOYEE";

export interface User {
  username: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  username: string;
  email: string;
  role: Role;
}

export interface LoginRequest {
  usernameOrEmail: string;
  password?: string;
}
