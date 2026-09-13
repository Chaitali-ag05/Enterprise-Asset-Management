import React, { useState, useMemo } from "react";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import { cn } from "../../utils/cn";
import { TableSkeleton } from "./Skeleton";

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: string;
  emptyAction?: React.ReactNode;
  pageSize?: number;
  keyExtractor: (item: T) => string | number;
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  emptyMessage = "No records found.",
  emptyAction,
  pageSize = 10,
  keyExtractor,
  className,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else {
        setSortKey(null);
        setSortDirection("asc");
      }
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];

      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (typeof valA === "string" && typeof valB === "string") {
        return sortDirection === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }

      return sortDirection === "asc" ? (valA > valB ? 1 : -1) : valA < valB ? 1 : -1;
    });
  }, [data, sortKey, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  return (
    <div className={cn("w-full border border-[#E5E9E7] dark:border-[#1E2B23] bg-white dark:bg-[#0D1511] rounded-xl overflow-hidden shadow-sm dark:shadow-card transition-colors duration-150", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E5E9E7] dark:border-[#18221D] bg-[#F8FAF9] dark:bg-[#080D0B]/80">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && handleSort(col.key)}
                  className={cn(
                    "py-3 px-4 text-xs font-mono uppercase text-[#526159] dark:text-[#8E9C94] select-none whitespace-nowrap tracking-wider",
                    col.sortable && "cursor-pointer hover:text-[#1A1D18] dark:hover:text-white",
                    col.className
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.header}</span>
                    {col.sortable && sortKey === col.key && (
                      <span className="text-[#2E8540] dark:text-[#A3FF5F]">
                        {sortDirection === "asc" ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E9E7] dark:divide-[#18221D] text-xs">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="p-0">
                  <TableSkeleton rows={pageSize} />
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2 text-[#74827A] dark:text-[#6C7B73]">
                    <Inbox size={28} className="text-[#74827A]/60 dark:text-[#46574F]" />
                    <p className="text-xs font-medium text-[#526159] dark:text-[#8E9C94]">{emptyMessage}</p>
                    {emptyAction && <div className="pt-2">{emptyAction}</div>}
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((item) => (
                <tr
                  key={keyExtractor(item)}
                  className="hover:bg-[#F8FAF9] dark:hover:bg-[#111A15] transition-colors border-b border-[#E5E9E7] dark:border-[#18221D]"
                >
                  {columns.map((col) => (
                    <td key={col.key} className={cn("py-3 px-4 text-xs text-[#1A1D18] dark:text-[#F3F7F4]", col.className)}>
                      {col.render ? col.render(item) : item[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {!loading && sortedData.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#E5E9E7] dark:border-[#18221D] bg-[#F8FAF9] dark:bg-[#080D0B] text-xs font-mono text-[#74827A] dark:text-[#6C7B73]">
          <div>
            Showing <span className="font-semibold text-[#1A1D18] dark:text-[#F3F7F4]">{(currentPage - 1) * pageSize + 1}</span> to{" "}
            <span className="font-semibold text-[#1A1D18] dark:text-[#F3F7F4]">{Math.min(currentPage * pageSize, sortedData.length)}</span> of{" "}
            <span className="font-semibold text-[#1A1D18] dark:text-[#F3F7F4]">{sortedData.length}</span> records
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-[#E5E9E7] dark:border-[#1E2B23] bg-white dark:bg-[#0D1511] hover:bg-[#F4F6F4] dark:hover:bg-[#151C18] disabled:opacity-30 disabled:cursor-not-allowed text-[#1A1D18] dark:text-[#F3F7F4] transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="px-2 font-semibold text-[#1A1D18] dark:text-[#F3F7F4]">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-[#E5E9E7] dark:border-[#1E2B23] bg-white dark:bg-[#0D1511] hover:bg-[#F4F6F4] dark:hover:bg-[#151C18] disabled:opacity-30 disabled:cursor-not-allowed text-[#1A1D18] dark:text-[#F3F7F4] transition-colors"
              aria-label="Next page"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}