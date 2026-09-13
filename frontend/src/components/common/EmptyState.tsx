import type { ReactNode } from "react";
import { FolderOpen, FilterX, ShieldAlert } from "lucide-react";
import { cn } from "../../utils/cn";

export interface EmptyStateProps {
  title?: string;
  message: string;
  icon?: ReactNode;
  action?: ReactNode;
  variant?: "filtered" | "scope" | "default";
  className?: string;
}

export default function EmptyState({
  title,
  message,
  icon,
  action,
  variant = "default",
  className,
}: EmptyStateProps) {
  const defaultIcon =
    variant === "filtered" ? (
      <FilterX size={26} className="text-amber-600 dark:text-amber-400" />
    ) : variant === "scope" ? (
      <ShieldAlert size={26} className="text-[#74827A] dark:text-[#8E9C94]" />
    ) : (
      <FolderOpen size={26} className="text-[#526159] dark:text-[#8E9C94]" />
    );

  const defaultTitle =
    title ||
    (variant === "filtered"
      ? "No records match these filters"
      : variant === "scope"
      ? "No records available in your current scope"
      : "No records found");

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-12 bg-white dark:bg-[#0D1511] border border-[#E5E9E7] dark:border-[#1E2B23] rounded-xl text-center shadow-sm dark:shadow-card transition-colors",
        className
      )}
    >
      <div className="w-14 h-14 bg-[#F8FAF9] dark:bg-[#151C18] border border-[#E5E9E7] dark:border-[#25312B] rounded-xl flex items-center justify-center mb-4">
        {icon || defaultIcon}
      </div>
      <h3 className="text-base font-semibold text-[#1A1D18] dark:text-[#F3F7F4] mb-1">
        {defaultTitle}
      </h3>
      <p className="text-sm text-[#526159] dark:text-[#8E9C94] max-w-md mx-auto mb-6">
        {message}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}


