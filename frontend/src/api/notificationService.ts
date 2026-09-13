import api from "./axios";
import type { NotificationResponse } from "../types/notification";

export const notificationService = {
  getAll: async (employeeId: number): Promise<NotificationResponse[]> => {
    const res = await api.get(`/notifications/employee/${employeeId}`);
    return res.data;
  },

  getUnread: async (employeeId: number): Promise<NotificationResponse[]> => {
    const res = await api.get(`/notifications/employee/${employeeId}/unread`);
    return res.data;
  },

  getUnreadCount: async (employeeId: number): Promise<{ unreadCount: number }> => {
    const res = await api.get(`/notifications/employee/${employeeId}/count-unread`);
    return res.data;
  },

  markAsRead: async (notificationId: number): Promise<NotificationResponse> => {
    const res = await api.put(`/notifications/${notificationId}/read`);
    return res.data;
  },

  markAllAsRead: async (employeeId: number): Promise<{ markedRead: number }> => {
    const res = await api.put(`/notifications/employee/${employeeId}/read-all`);
    return res.data;
  }
};

