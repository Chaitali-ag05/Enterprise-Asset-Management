import api from "./axios";
import { type DashboardResponse } from "../types/dashboard";

export const analyticsService = {
  getDashboard: async (): Promise<DashboardResponse> => {
    const res = await api.get("/analytics/dashboard");
    return res.data;
  }
};

