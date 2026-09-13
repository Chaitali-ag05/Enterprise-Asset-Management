import api from "./axios";
import type { AssignmentRequest, AssignmentResponse, AssignmentItemResponse } from "../types/assignment";

export const assignmentService = {
  getAll: async (): Promise<AssignmentResponse[]> => {
    const res = await api.get("/assignments");
    return res.data;
  },
  
  getByEmployeeId: async (employeeId: number): Promise<AssignmentResponse[]> => {
    const res = await api.get(`/assignments/employee/${employeeId}`);
    return res.data;
  },
  
  getById: async (id: number): Promise<AssignmentResponse> => {
    const res = await api.get(`/assignments/${id}`);
    return res.data;
  },
  
  create: async (data: AssignmentRequest): Promise<AssignmentResponse> => {
    const res = await api.post("/assignments", data);
    return res.data;
  },
  
  returnItem: async (assignmentId: number, itemId: number, remarks: string): Promise<AssignmentResponse> => {
    const params = new URLSearchParams();
    if (remarks) {
      params.append("remarks", remarks);
    }
    const res = await api.put(`/assignments/${assignmentId}/items/${itemId}/return?${params.toString()}`);
    return res.data;
  },
  
  getItems: async (assignmentId: number): Promise<AssignmentItemResponse[]> => {
    const res = await api.get(`/assignments/${assignmentId}/items`);
    return res.data;
  }
};

