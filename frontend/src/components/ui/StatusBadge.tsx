import React from "react";
import { cn } from "../../utils/cn";

export interface StatusBadgeProps {
  status: string;
  className?: string;
  size?: "xs" | "sm" | "md";
  showDot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className,
  size = "sm",
  showDot = true,
}) => {
  const normStatus = (status || "").toUpperCase();

  const getStatusColor = (st: string) => {
    switch (st) {
      case "ACTIVE":
      case "AVAILABLE":
      case "COMPLETED":
      case "RESOLVED":
      case "ACCEPTED":
      case "APPROVED":
        return {
          bg: "bg-[#EAF7EE] dark:bg-[#A3FF5F]/10",
          text: "text-[#1E6B30] dark:text-[#A3FF5F]",
          border: "border-[#C2E8CE] dark:border-[#A3FF5F]/30",
          dot: "bg-[#2E8540] dark:bg-[#A3FF5F]",
        };
      case "ASSIGNED":
      case "IN_PROGRESS":
      case "INVESTIGATING":
        return {
          bg: "bg-[#E6F9F6] dark:bg-[#55D6BE]/10",
          text: "text-[#0D9488] dark:text-[#55D6BE]",
          border: "border-[#BCEEE7] dark:border-[#55D6BE]/30",
          dot: "bg-[#0D9488] dark:bg-[#55D6BE]",
        };
      case "UNDER_MAINTENANCE":
      case "UNDER_REVIEW":
      case "PENDING_ACCEPTANCE":
      case "MEDIUM":
      case "HIGH":
        return {
          bg: "bg-[#FEF6E7] dark:bg-amber-500/10",
          text: "text-[#D97706] dark:text-amber-400",
          border: "border-[#FDE6B8] dark:border-amber-500/30",
          dot: "bg-[#D97706] dark:bg-amber-400",
        };
      case "CRITICAL":
      case "REJECTED":
      case "LOST":
      case "DAMAGED":
      case "NOT_REPAIRABLE":
        return {
          bg: "bg-[#FEE2E2] dark:bg-red-500/15",
          text: "text-[#DC2626] dark:text-red-400",
          border: "border-[#FECACA] dark:border-red-500/35",
          dot: "bg-[#DC2626] dark:bg-red-400",
        };
      case "RETIRED":
      case "INACTIVE":
      case "CANCELLED":
      case "LOW":
      default:
        return {
          bg: "bg-[#F4F6F4] dark:bg-[#151C18]",
          text: "text-[#526159] dark:text-[#87948C]",
          border: "border-[#E5E9E7] dark:border-[#25312B]",
          dot: "bg-[#74827A] dark:bg-[#59655E]",
        };
    }
  };

  const style = getStatusColor(normStatus);

  const sizeClasses = {
    xs: "px-1.5 py-0.5 text-[10px]",
    sm: "px-2 py-0.5 text-2xs",
    md: "px-2.5 py-1 text-xs",
  };

  const displayLabel = status ? status.replace(/_/g, " ") : "UNKNOWN";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-mono font-medium rounded-md border uppercase tracking-wider select-none",
        style.bg,
        style.text,
        style.border,
        sizeClasses[size],
        className
      )}
    >
      {showDot && <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", style.dot)} />}
      <span>{displayLabel}</span>
    </span>
  );
};