import api from "./axios";
import { type LoginRequest, type AuthResponse } from "../types/auth";

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role?: string;
}

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post("/auth/login", data);
    return response.data;
  },
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post("/auth/register", data);
    return response.data;
  },
};