import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../utils/cn";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "xs" | "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, icon, children, disabled, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[#2E8540]/40 dark:focus:ring-[#A3FF5F]/40 disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-xl";

    const variantStyles = {
      primary: "bg-[#2E8540] hover:bg-[#236C33] text-white dark:bg-[#A3FF5F] dark:hover:bg-[#8EF04C] dark:text-[#080D0B] font-semibold shadow-sm dark:shadow-lime-glow",
      secondary: "bg-[#F4F6F4] hover:bg-[#EBF1ED] text-[#1A1D18] border border-[#E5E9E7] dark:bg-[#151C18] dark:hover:bg-[#19221D] dark:text-[#F3F7F4] dark:border-[#25312B]",
      outline: "border border-[#E5E9E7] dark:border-[#25312B] bg-transparent hover:bg-[#F4F6F4] dark:hover:bg-[#151C18] text-[#1A1D18] dark:text-[#F3F7F4] hover:border-[#CBD5E1] dark:hover:border-[#2B3831]",
      ghost: "text-[#526159] dark:text-[#C0CCC5] hover:text-[#1A1D18] dark:hover:text-[#F3F7F4] hover:bg-[#F4F6F4] dark:hover:bg-[#151C18]",
      destructive: "bg-red-50 dark:bg-red-500/15 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30 hover:bg-red-100 dark:hover:bg-red-500/25",
    };

    const sizeStyles = {
      xs: "h-7 px-2.5 text-xs gap-1.5",
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-9 px-4 text-sm gap-2",
      lg: "h-11 px-5 text-base gap-2.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : icon ? <span className="shrink-0">{icon}</span> : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";