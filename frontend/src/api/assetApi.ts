import api from "./axios";
import { type AssetRequest, type AssetResponse } from "../types/asset";

export const assetApi = {
  getAll: async (): Promise<AssetResponse[]> => {
    const res = await api.get("/assets");
    return res.data;
  },
  
  getByEmployeeId: async (employeeId: number): Promise<AssetResponse[]> => {
    const res = await api.get(`/assets/employee/${employeeId}`);
    return res.data;
  },
  
  getById: async (id: number): Promise<AssetResponse> => {
    const res = await api.get(`/assets/${id}`);
    return res.data;
  },
  
  create: async (data: AssetRequest): Promise<AssetResponse> => {
    const res = await api.post("/assets", data);
    return res.data;
  },
  
  update: async (id: number, data: AssetRequest): Promise<AssetResponse> => {
    const res = await api.put(`/assets/${id}`, data);
    return res.data;
  },
  
  delete: async (id: number): Promise<void> => {
    await api.delete(`/assets/${id}`);
  }
};

