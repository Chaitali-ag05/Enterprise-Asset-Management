import api from "./axios";
import { type DepartmentResponse } from "../types/department";

export interface DepartmentRequest {
  name: string;
}

export const departmentService = {
  getAll: async (): Promise<DepartmentResponse[]> => {
    const res = await api.get("/departments");
    return res.data;
  },
  
  getById: async (id: number): Promise<DepartmentResponse> => {
    const res = await api.get(`/departments/${id}`);
    return res.data;
  },
  
  create: async (data: DepartmentRequest): Promise<DepartmentResponse> => {
    const res = await api.post("/departments", data);
    return res.data;
  },
  
  update: async (id: number, data: DepartmentRequest): Promise<DepartmentResponse> => {
    const res = await api.put(`/departments/${id}`, data);
    return res.data;
  },
  
  delete: async (id: number): Promise<void> => {
    await api.delete(`/departments/${id}`);
  }
};
