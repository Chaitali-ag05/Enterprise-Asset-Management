import api from "./axios";
import type {
  MaintenanceIssueResponse,
  MaintenanceWorkOrderResponse,
  MaintenanceHistoryResponse,
  ReportIssueRequest,
  AssignTechnicianRequest,
  RespondWorkOrderRequest,
  RejectWorkOrderRequest,
  CompleteRepairRequest,
  NotRepairableRequest,
  ManagerDecisionRequest
} from "../types/maintenance";

export const maintenanceService = {
  // Issues
  reportIssue: async (data: ReportIssueRequest): Promise<MaintenanceIssueResponse> => {
    const res = await api.post("/maintenance/issues", data);
    return res.data;
  },
  
  getIssues: async (): Promise<MaintenanceIssueResponse[]> => {
    const res = await api.get("/maintenance/issues");
    return res.data;
  },
  getIssuesByReporter: async (employeeId: number): Promise<MaintenanceIssueResponse[]> => {
    const res = await api.get(`/maintenance/issues/reported-by/${employeeId}`);
    return res.data;
  },
  
  getIssueById: async (id: number): Promise<MaintenanceIssueResponse> => {
    const res = await api.get(`/maintenance/issues/${id}`);
    return res.data;
  },

  assignTechnician: async (issueId: number, data: AssignTechnicianRequest): Promise<MaintenanceWorkOrderResponse> => {
    const res = await api.post(`/maintenance/issues/${issueId}/work-orders`, data);
    return res.data;
  },

  getWorkOrdersByIssue: async (issueId: number): Promise<MaintenanceWorkOrderResponse[]> => {
    const res = await api.get(`/maintenance/issues/${issueId}/work-orders`);
    return res.data;
  },

  applyIssueDecision: async (issueId: number, data: ManagerDecisionRequest): Promise<MaintenanceIssueResponse> => {
    const res = await api.put(`/maintenance/issues/${issueId}/decision`, data);
    return res.data;
  },

  // Work Orders
  startWorkOrder: async (workOrderId: number): Promise<MaintenanceWorkOrderResponse> => {
    const res = await api.put(`/maintenance/work-orders/${workOrderId}/start`);
    return res.data;
  },

  respondToWorkOrder: async (workOrderId: number, data: RespondWorkOrderRequest): Promise<MaintenanceWorkOrderResponse> => {
    const res = await api.put(`/maintenance/work-orders/${workOrderId}/respond`, data);
    return res.data;
  },

  rejectWorkOrder: async (workOrderId: number, data: RejectWorkOrderRequest): Promise<MaintenanceWorkOrderResponse> => {
    const res = await api.put(`/maintenance/work-orders/${workOrderId}/reject`, data);
    return res.data;
  },

  completeRepair: async (workOrderId: number, data: CompleteRepairRequest): Promise<MaintenanceWorkOrderResponse> => {
    const res = await api.put(`/maintenance/work-orders/${workOrderId}/complete`, data);
    return res.data;
  },

  markNotRepairable: async (workOrderId: number, data: NotRepairableRequest): Promise<MaintenanceWorkOrderResponse> => {
    const res = await api.put(`/maintenance/work-orders/${workOrderId}/not-repairable`, data);
    return res.data;
  },

  applyWorkOrderDecision: async (workOrderId: number, data: ManagerDecisionRequest): Promise<MaintenanceWorkOrderResponse> => {
    const res = await api.put(`/maintenance/work-orders/${workOrderId}/decision`, data);
    return res.data;
  },

  getWorkOrdersByTechnician: async (technicianId: number): Promise<MaintenanceWorkOrderResponse[]> => {
    const res = await api.get(`/maintenance/work-orders/technician/${technicianId}`);
    return res.data;
  },

  // History
  getAssetHistory: async (assetId: number): Promise<MaintenanceHistoryResponse> => {
    const res = await api.get(`/maintenance/assets/${assetId}/history`);
    return res.data;
  }
};

