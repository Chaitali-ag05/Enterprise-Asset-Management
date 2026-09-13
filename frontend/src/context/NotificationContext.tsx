import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { notificationService } from "../api/notificationService";
import { employeeApi } from "../api/employeeApi";
import { useAuthStore } from "./useAuthStore";
import { useToast } from "./ToastContext";
import type { NotificationResponse } from "../types/notification";

interface NotificationContextType {
  unreadCount: number;
  notifications: NotificationResponse[];
  loading: boolean;
  employeeId: number | null;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const { addToast } = useToast();
  
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const loadEmployeeId = useCallback(async () => {
    try {
      setLoading(true);
      const me = await employeeApi.getMe();
      if (me && me.id) {
        setEmployeeId(me.id);
      } else {
        setLoading(false);
      }
    } catch (err: unknown) {
      setEmployeeId(null);
      setLoading(false);
    }
  }, []);

  // Initialize employee ID once on login or auth change
  useEffect(() => {
    if (isAuthenticated) {
      loadEmployeeId();
    } else {
      setEmployeeId(null);
      setUnreadCount(0);
      setNotifications([]);
      setLoading(false);
    }
  }, [isAuthenticated, loadEmployeeId]);

  const refreshNotifications = useCallback(async () => {
    if (!employeeId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await notificationService.getAll(employeeId);
      const sorted = (data || []).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setNotifications(sorted);
      
      const unread = sorted.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    } catch (err: unknown) {
      // Don't crash or spam toasts on initial load
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  // Fetch notifications whenever employeeId is resolved
  useEffect(() => {
    if (employeeId) {
      refreshNotifications();
    }
  }, [employeeId, refreshNotifications]);

  const markAsRead = useCallback(async (id: number) => {
    if (!employeeId) return;
    try {
      // Optimistic update
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Actual API call
      await notificationService.markAsRead(id);
    } catch (err: unknown) {
      addToast("error", "Failed to mark notification as read.");
      refreshNotifications(); 
    }
  }, [employeeId, addToast, refreshNotifications]);

  const markAllAsRead = useCallback(async () => {
    if (!employeeId) return;
    try {
      // Optimistic update
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      
      // Actual API call
      await notificationService.markAllAsRead(employeeId);
    } catch (err: unknown) {
      addToast("error", "Failed to mark all as read.");
      refreshNotifications();
    }
  }, [employeeId, addToast, refreshNotifications]);

  return (
    <NotificationContext.Provider value={{
      unreadCount,
      notifications,
      loading,
      employeeId,
      refreshNotifications,
      markAsRead,
      markAllAsRead
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}