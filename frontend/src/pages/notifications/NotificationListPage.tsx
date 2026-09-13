import React from "react";
import { useNavigate } from "react-router-dom";
import { Check, CheckCheck, Inbox, Wrench, Package, AlertCircle, Info } from "lucide-react";
import { useNotifications } from "../../context/NotificationContext";
import { PageHeader } from "../../components/ui/PageHeader";
import { Button } from "../../components/ui/Button";
import { formatDate } from "../../utils/formatDate";
import { cn } from "../../utils/cn";
import type { NotificationResponse } from "../../types/notification";

export default function NotificationListPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = async (n: NotificationResponse) => {
    if (!n.isRead) {
      await markAsRead(n.id);
    }
    if (n.referenceId && n.referenceType) {
      const type = n.referenceType.toUpperCase();
      if (type.includes("MAINTENANCE") || type.includes("ISSUE") || type.includes("WORK_ORDER")) {
        navigate(`/maintenance/${n.referenceId}`);
      } else if (type.includes("ASSIGNMENT")) {
        navigate(`/assignments/${n.referenceId}`);
      } else if (type.includes("ASSET")) {
        navigate(`/assets/${n.referenceId}`);
      }
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "WORK_ORDER_ASSIGNED":
      case "MAINTENANCE_UPDATE":
      case "MAINTENANCE_REPORTED":
      case "MAINTENANCE_ASSIGNED":
      case "MAINTENANCE_COMPLETED":
        return <Wrench size={14} className="text-amber-500 shrink-0" />;
      case "ASSET_ASSIGNED":
      case "ASSIGNMENT_CREATED":
      case "ASSET_RETURNED":
        return <Package size={14} className="text-blue-500 shrink-0" />;
      case "URGENT":
      case "CRITICAL":
        return <AlertCircle size={14} className="text-rose-500 shrink-0" />;
      default:
        return <Info size={14} className="text-brand shrink-0" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Notification Center"
        description="Operational alerts, dispatch events, work order progress, and assignment notifications."
        actions={
          unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead} icon={<CheckCheck size={14} />}>
              Mark All Read ({unreadCount})
            </Button>
          )
        }
      />

      <div className="bg-white dark:bg-[#111714] border border-[#E5E9E7] dark:border-[#25312B] rounded-xl overflow-hidden shadow-sm dark:shadow-card">
        {loading && notifications.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#718278] dark:text-[#87948C]">
            Loading operational notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center text-[#718278] dark:text-[#87948C] space-y-2">
            <Inbox size={32} className="mx-auto text-[#718278] dark:text-[#87948C]" />
            <p className="text-xs font-semibold text-[#1A1D18] dark:text-[#F3F7F4]">No Notifications</p>
            <p className="text-2xs text-[#718278] dark:text-[#87948C]">Your notification inbox is clear.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#E5E9E7] dark:divide-[#25312B]">
            {notifications.map((n) => {
              const isUnread = !n.isRead;
              return (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={cn(
                    "p-4 flex items-start justify-between gap-4 cursor-pointer transition-colors text-xs",
                    isUnread
                      ? "bg-primary-50/40 hover:bg-primary-50/70 dark:bg-[#151C18] dark:hover:bg-[#19221D]"
                      : "hover:bg-[#F3F7F4] dark:hover:bg-[#151C18]/60"
                  )}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="mt-0.5">{getIcon(n.type)}</div>
                    <div className="space-y-0.5 min-w-0">
                      <p className={cn("text-xs", isUnread ? "font-semibold text-[#1A1D18] dark:text-[#F3F7F4]" : "text-[#526159] dark:text-[#C0CCC5]")}>
                        {n.title || n.message}
                      </p>
                      {n.title && n.message && (
                        <p className="text-2xs text-[#718278] dark:text-[#87948C]">{n.message}</p>
                      )}
                      <span className="text-[10px] font-mono text-[#718278] dark:text-[#87948C] block pt-1">
                        {formatDate(n.createdAt)}
                      </span>
                    </div>
                  </div>

                  {isUnread && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(n.id);
                      }}
                      className="p-1 rounded text-[#718278] hover:text-[#1E6B30] dark:text-[#87948C] dark:hover:text-[#A3FF5F] transition-colors shrink-0"
                      title="Mark read"
                    >
                      <Check size={14} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}