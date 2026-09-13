export type NotificationType =
  | "ASSIGNMENT_CREATED"
  | "ASSET_RETURNED"
  | "MAINTENANCE_REPORTED"
  | "MAINTENANCE_ASSIGNED"
  | "MAINTENANCE_COMPLETED"
  | "MAINTENANCE_REJECTED"
  | "GENERAL";

export interface NotificationResponse {
  id: number;
  recipientId: number;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  referenceId: number | null;
  referenceType: string | null;
  createdAt: string;
}

