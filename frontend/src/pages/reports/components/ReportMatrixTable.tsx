import React from "react";
import { cn } from "../../../utils/cn";

export interface MatrixColumn {
  key: string;
  label: string;
}

export interface MatrixRow {
  id: string | number;
  label: string;
  values: Record<string, number>;
  total: number;
}

export interface ReportMatrixTableProps {
  title: string;
  subtitle?: string;
  rowHeaderTitle: string;
  columns: MatrixColumn[];
  rows: MatrixRow[];
  columnTotals?: Record<string, number>;
  grandTotal?: number;
  className?: string;
}

export const ReportMatrixTable: React.FC<ReportMatrixTableProps> = ({
  title,
  subtitle,
  rowHeaderTitle,
  columns,
  rows,
  columnTotals,
  grandTotal,
  className,
}) => {
  return (
    <div className={cn("p-4 sm:p-5 rounded-xl bg-white dark:bg-[#0D1511] border border-[#E5E9E7] dark:border-[#1E2B23] shadow-sm dark:shadow-card space-y-3 transition-colors duration-150", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-[#E5E9E7] dark:border-[#18221D] pb-3">
        <div>
          <h3 className="font-heading font-semibold text-xs text-[#1A1D18] dark:text-[#F3F7F4] uppercase tracking-wider">
            {title}
          </h3>
          {subtitle && (
            <p className="text-2xs text-[#526159] dark:text-[#8E9C94] mt-0.5">{subtitle}</p>
          )}
        </div>
        <span className="text-[10px] font-mono font-semibold text-[#2E8540] dark:text-[#A3FF5F] bg-[#E8F8EE] dark:bg-[#14261B] border border-[#C2E8CE] dark:border-[#234A31] px-2 py-0.5 rounded self-start sm:self-auto">
          Matrix Breakdown
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[500px]">
          <thead>
            <tr className="border-b border-[#E5E9E7] dark:border-[#18221D] bg-[#F8FAF9] dark:bg-[#080D0B]/80 text-[11px] font-mono uppercase text-[#526159] dark:text-[#8E9C94] tracking-wider">
              <th className="py-2.5 px-3 font-semibold text-[#1A1D18] dark:text-[#F3F7F4] whitespace-nowrap">
                {rowHeaderTitle}
              </th>
              {columns.map((col) => (
                <th key={col.key} className="py-2.5 px-3 text-right font-semibold whitespace-nowrap">
                  {col.label}
                </th>
              ))}
              <th className="py-2.5 px-3 text-right font-bold text-[#1E6B30] dark:text-[#A3FF5F] whitespace-nowrap">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E9E7] dark:divide-[#18221D] text-xs font-mono">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 2} className="py-8 text-center text-xs text-[#74827A] dark:text-[#6C7B73]">
                  No breakdown data available in current scope.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-[#F8FAF9] dark:hover:bg-[#111A15] transition-colors"
                >
                  <td className="py-2.5 px-3 font-sans font-medium text-[#1A1D18] dark:text-[#F3F7F4] truncate max-w-[180px]">
                    {row.label}
                  </td>
                  {columns.map((col) => {
                    const val = row.values[col.key] || 0;
                    return (
                      <td
                        key={col.key}
                        className={cn(
                          "py-2.5 px-3 text-right",
                          val > 0 ? "text-[#1A1D18] dark:text-[#F3F7F4] font-medium" : "text-[#8E9C94]/60 dark:text-[#526159]"
                        )}
                      >
                        {val}
                      </td>
                    );
                  })}
                  <td className="py-2.5 px-3 text-right font-bold text-[#1E6B30] dark:text-[#A3FF5F] bg-[#F8FAF9]/50 dark:bg-[#080D0B]/30">
                    {row.total}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {rows.length > 0 && columnTotals && (
            <tfoot>
              <tr className="border-t-2 border-[#E5E9E7] dark:border-[#27382F] bg-[#F8FAF9] dark:bg-[#080D0B] text-xs font-mono font-bold">
                <td className="py-2.5 px-3 text-[#1A1D18] dark:text-[#F3F7F4] uppercase text-[11px]">
                  Total
                </td>
                {columns.map((col) => (
                  <td key={col.key} className="py-2.5 px-3 text-right text-[#1A1D18] dark:text-[#F3F7F4]">
                    {columnTotals[col.key] || 0}
                  </td>
                ))}
                <td className="py-2.5 px-3 text-right text-[#1E6B30] dark:text-[#A3FF5F] text-sm">
                  {grandTotal !== undefined ? grandTotal : Object.values(columnTotals).reduce((a, b) => a + b, 0)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};
