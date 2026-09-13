import React from "react";
import { cn } from "../../utils/cn";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, id, children, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-mono uppercase tracking-wider text-[#526159] dark:text-[#C0CCC5]">
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={cn(
            "w-full h-10 rounded-xl border bg-white dark:bg-[#111714] px-3.5 text-sm text-[#1A1D18] dark:text-[#F3F7F4] transition-all focus:outline-none focus:border-[#2E8540] dark:focus:border-[#A3FF5F] focus:ring-1 focus:ring-[#2E8540] dark:focus:ring-[#A3FF5F] disabled:opacity-50 disabled:bg-[#F4F6F4] dark:disabled:bg-[#0D1210] disabled:cursor-not-allowed",
            error
              ? "border-red-500/80 focus:border-red-500 focus:ring-red-500"
              : "border-[#E5E9E7] dark:border-[#25312B] hover:border-[#CBD5E1] dark:hover:border-[#2B3831]",
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error ? (
          <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-[#526159] dark:text-[#87948C]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = "Select";