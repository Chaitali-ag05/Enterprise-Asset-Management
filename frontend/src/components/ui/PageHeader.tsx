import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "../../utils/cn";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumbs,
  badge,
  actions,
  className,
}) => {
  return (
    <div className={cn("space-y-1.5 pb-4 border-b border-[#E5E9E7] dark:border-[#25312B] transition-colors duration-150", className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-xs font-mono text-[#526159] dark:text-[#87948C] mb-1">
          {breadcrumbs.map((item, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <ChevronRight size={12} className="text-[#74827A] dark:text-[#59655E]" />}
              {item.href ? (
                <Link to={item.href} className="hover:text-[#2E8540] dark:hover:text-[#A3FF5F] transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className="text-[#1A1D18] dark:text-[#F3F7F4] font-semibold">{item.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div className="flex items-center gap-3">
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#1A1D18] dark:text-[#F3F7F4] tracking-tight">
            {title}
          </h1>
          {badge}
        </div>
        {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
      </div>

      {description && (
        <p className="text-sm text-[#526159] dark:text-[#C0CCC5] max-w-3xl leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
};