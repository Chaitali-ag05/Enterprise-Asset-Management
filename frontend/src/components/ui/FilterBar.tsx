import React from "react";
import { Search, X } from "lucide-react";
import { cn } from "../../utils/cn";

export interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Search records...",
  filters,
  hasActiveFilters,
  onClearFilters,
  className,
}) => {
  return (
    <div className={cn("flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3", className)}>
      <div className="relative flex-1 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#74827A] pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full h-9 pl-9 pr-9 text-xs rounded-xl bg-white dark:bg-[#111714] border border-[#E5E9E7] dark:border-[#25312B] text-[#1A1D18] dark:text-[#F3F7F4] placeholder-[#8E9C94] dark:placeholder-[#59655E] focus:outline-none focus:border-[#2E8540] dark:focus:border-[#A3FF5F] focus:ring-1 focus:ring-[#2E8540] dark:focus:ring-[#A3FF5F] transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#74827A] hover:text-[#1A1D18] dark:hover:text-[#F3F7F4] p-0.5"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {(filters || hasActiveFilters) && (
        <div className="flex items-center gap-2.5 flex-wrap">
          {filters}
          {hasActiveFilters && onClearFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="text-xs font-mono text-[#526159] dark:text-[#87948C] hover:text-[#2E8540] dark:hover:text-[#A3FF5F] flex items-center gap-1.5 transition-colors px-2 py-1"
            >
              <X size={12} /> Reset
            </button>
          )}
        </div>
      )}
    </div>
  );
};