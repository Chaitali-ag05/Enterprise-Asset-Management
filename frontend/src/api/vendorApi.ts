import api from "./axios";
import type { VendorResponse } from "../types/vendor";

export interface VendorRequest {
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export const vendorApi = {
  getAll: async (): Promise<VendorResponse[]> => {
    const res = await api.get("/vendors");
    return res.data;
  },
  create: async (data: VendorRequest): Promise<VendorResponse> => {
    const res = await api.post("/vendors", data);
    return res.data;
  },
  update: async (id: number, data: VendorRequest): Promise<VendorResponse> => {
    const res = await api.put(`/vendors/${id}`, data);
    return res.data;
  },
  activate: async (id: number): Promise<VendorResponse> => {
    const res = await api.put(`/vendors/${id}/activate`);
    return res.data;
  },
  deactivate: async (id: number): Promise<VendorResponse> => {
    const res = await api.put(`/vendors/${id}/deactivate`);
    return res.data;
  }
};