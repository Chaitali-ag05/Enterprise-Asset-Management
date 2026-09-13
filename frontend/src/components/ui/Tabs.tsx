import React from "react";
import { cn } from "../../utils/cn";

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className }) => {
  return (
    <div className={cn("flex items-center gap-1 border-b border-[#E5E9E7] dark:border-[#25312B] overflow-x-auto transition-colors duration-150", className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors select-none",
              isActive
                ? "border-[#2E8540] dark:border-[#A3FF5F] text-[#1E6B30] dark:text-[#F3F7F4] font-semibold"
                : "border-transparent text-[#526159] dark:text-[#87948C] hover:text-[#1A1D18] dark:hover:text-[#C0CCC5] hover:border-[#E5E9E7] dark:hover:border-[#25312B]"
            )}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  "ml-1.5 px-2 py-0.5 rounded-full font-mono text-xs",
                  isActive
                    ? "bg-[#E8F8EE] dark:bg-[#A3FF5F]/15 text-[#1E6B30] dark:text-[#A3FF5F] font-bold"
                    : "bg-[#F4F6F4] dark:bg-[#151C18] text-[#526159] dark:text-[#87948C] border border-[#E5E9E7] dark:border-[#25312B]"
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};