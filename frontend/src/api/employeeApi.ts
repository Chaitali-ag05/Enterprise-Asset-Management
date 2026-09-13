import api from "./axios";
import { type EmployeeRequest, type EmployeeResponse } from "../types/employee";

export const employeeApi = {
  updateMe: async (data: any) => {
    const response = await api.put('/employees/me', data);
    return response.data;
  },
  getAll: async (): Promise<EmployeeResponse[]> => {
    const res = await api.get("/employees");
    return res.data;
  },

  getMe: async (): Promise<EmployeeResponse> => {
    const res = await api.get("/employees/me");
    return res.data;
  },
  
  getById: async (id: number): Promise<EmployeeResponse> => {
    const res = await api.get(`/employees/${id}`);
    return res.data;
  },
  
  create: async (data: EmployeeRequest): Promise<EmployeeResponse> => {
    const res = await api.post("/employees", data);
    return res.data;
  },
  
  update: async (id: number, data: EmployeeRequest): Promise<EmployeeResponse> => {
    const res = await api.put(`/employees/${id}`, data);
    return res.data;
  },
  
  delete: async (id: number): Promise<void> => {
    await api.delete(`/employees/${id}`);
  }
};
