import React from "react";
import { cn } from "../../utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  mono?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, startIcon, endIcon, mono, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-mono uppercase tracking-wider text-[#526159] dark:text-[#C0CCC5]">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {startIcon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-[#74827A] dark:text-[#74827A]">
              {startIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              "w-full h-10 rounded-xl border bg-white dark:bg-[#111714] px-3.5 text-sm text-[#1A1D18] dark:text-[#F3F7F4] placeholder-[#8E9C94] dark:placeholder-[#59655E] transition-all focus:outline-none focus:border-[#2E8540] dark:focus:border-[#A3FF5F] focus:ring-1 focus:ring-[#2E8540] dark:focus:ring-[#A3FF5F] disabled:opacity-50 disabled:bg-[#F4F6F4] dark:disabled:bg-[#0D1210] disabled:cursor-not-allowed",
              mono && "font-mono",
              startIcon && "pl-9",
              endIcon && "pr-9",
              error
                ? "border-red-500/80 focus:border-red-500 focus:ring-red-500"
                : "border-[#E5E9E7] dark:border-[#25312B] hover:border-[#CBD5E1] dark:hover:border-[#2B3831]",
              className
            )}
            {...props}
          />
          {endIcon && (
            <div className="absolute right-3 flex items-center text-[#74827A]">
              {endIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-[#526159] dark:text-[#87948C]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";