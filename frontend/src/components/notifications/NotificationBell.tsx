import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, Check, CheckCheck, Loader2, Info, AlertCircle, Wrench, Package } from "lucide-react";
import { useNotifications } from "../../context/NotificationContext";
import { formatDate } from "../../utils/formatDate";
import { cn } from "../../utils/cn";
import type { NotificationResponse } from "../../types/notification";

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, refreshNotifications, loading } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!isOpen) {
      refreshNotifications();
    }
    setIsOpen(!isOpen);
  };

  const handleNotificationClick = async (notification: NotificationResponse) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    setIsOpen(false);

    if (notification.referenceId && notification.referenceType) {
      const type = notification.referenceType.toUpperCase();
      if (type.includes("MAINTENANCE") || type.includes("ISSUE") || type.includes("WORK_ORDER")) {
        navigate(`/maintenance/${notification.referenceId}`);
      } else if (type.includes("ASSIGNMENT")) {
        navigate(`/assignments/${notification.referenceId}`);
      } else if (type.includes("ASSET")) {
        navigate(`/assets/${notification.referenceId}`);
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
        return <Wrench size={13} className="text-amber-500 shrink-0" />;
      case "ASSET_ASSIGNED":
      case "ASSIGNMENT_CREATED":
      case "ASSET_RETURNED":
        return <Package size={13} className="text-blue-500 shrink-0" />;
      case "URGENT":
      case "CRITICAL":
        return <AlertCircle size={13} className="text-rose-500 shrink-0" />;
      default:
        return <Info size={13} className="text-[#2E8540] dark:text-[#A3FF5F] shrink-0" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={handleToggle}
        className="relative p-1.5 rounded-lg text-[#526159] dark:text-[#C0CCC5] hover:text-[#1A1D18] dark:hover:text-[#F3F7F4] hover:bg-[#F4F6F4] dark:hover:bg-[#151C18] border border-transparent hover:border-[#E5E9E7] dark:hover:border-[#25312B] transition-colors"
        aria-label={`Notifications (${unreadCount} unread)`}
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[14px] h-[14px] px-0.5 bg-[#2E8540] dark:bg-[#A3FF5F] text-white dark:text-[#080D0B] text-[9px] font-mono font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-[#080D0B]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-80 sm:w-96 bg-white dark:bg-[#111714] border border-[#E5E9E7] dark:border-[#25312B] rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-[#E5E9E7] dark:border-[#25312B] bg-[#F8FAF9] dark:bg-[#151C18]">
            <div className="flex items-center gap-2">
              <span className="font-heading font-semibold text-xs text-[#1A1D18] dark:text-[#F3F7F4]">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#E8F8EE] dark:bg-[#A3FF5F]/15 text-[#1E6B30] dark:text-[#A3FF5F] border border-[#C2E8CE] dark:border-[#A3FF5F]/30 font-medium">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-[11px] font-mono text-[#526159] dark:text-[#87948C] hover:text-[#2E8540] dark:hover:text-[#A3FF5F] flex items-center gap-1 transition-colors"
              >
                <CheckCheck size={12} />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-[#E5E9E7] dark:divide-[#25312B]/50">
            {loading && notifications.length === 0 ? (
              <div className="py-8 flex items-center justify-center text-[#74827A] dark:text-[#87948C]">
                <Loader2 size={16} className="animate-spin mr-2" />
                <span className="text-xs font-mono">Loading notifications...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center text-xs text-[#74827A] dark:text-[#87948C] font-mono">
                No notifications right now.
              </div>
            ) : (
              notifications.slice(0, 10).map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={cn(
                    "p-3 text-xs flex items-start gap-2.5 cursor-pointer transition-colors",
                    !n.isRead ? "bg-[#F8FAF9] dark:bg-[#151C18]/60 hover:bg-[#F0F4F1] dark:hover:bg-[#151C18]" : "hover:bg-[#F8FAF9] dark:hover:bg-[#151C18]/40 opacity-75"
                  )}
                >
                  <div className="mt-0.5">{getIcon(n.type || "")}</div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("font-medium leading-snug truncate", !n.isRead ? "text-[#1A1D18] dark:text-[#F3F7F4] font-semibold" : "text-[#526159] dark:text-[#C0CCC5]")}>
                      {n.title || "Notification"}
                    </p>
                    <p className="text-[#526159] dark:text-[#87948C] line-clamp-2 mt-0.5 text-[11px] leading-relaxed">
                      {n.message}
                    </p>
                    <span className="text-[10px] font-mono text-[#74827A] dark:text-[#59655E] block mt-1">
                      {formatDate(n.createdAt)}
                    </span>
                  </div>
                  {!n.isRead && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(n.id);
                      }}
                      className="text-[#74827A] dark:text-[#87948C] hover:text-[#2E8540] dark:hover:text-[#A3FF5F] p-1 rounded hover:bg-[#E5E9E7] dark:hover:bg-[#25312B] transition-colors shrink-0"
                      title="Mark as read"
                    >
                      <Check size={12} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="p-2 border-t border-[#E5E9E7] dark:border-[#25312B] bg-[#F8FAF9] dark:bg-[#151C18] text-center">
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-mono text-[#2E8540] dark:text-[#A3FF5F] hover:underline"
            >
              View all notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}