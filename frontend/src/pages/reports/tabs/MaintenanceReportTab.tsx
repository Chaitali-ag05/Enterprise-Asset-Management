import React, { useMemo } from "react";
import { Download, Wrench, CheckCircle2, RotateCcw } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { MaintenanceReportItem, MaintenanceFilters } from "../types";
import type { DepartmentResponse } from "../../../types/department";
import { DataTable, type Column } from "../../../components/ui/DataTable";
import { FilterBar } from "../../../components/ui/FilterBar";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { Button } from "../../../components/ui/Button";
import EmptyState from "../../../components/common/EmptyState";
import { ReportMatrixTable, type MatrixColumn, type MatrixRow } from "../components/ReportMatrixTable";
import { SavedViewsDropdown } from "../components/SavedViewsDropdown";
import { exportToCsv } from "../utils/reportUtils";
import { formatDate } from "../../../utils/formatDate";

export interface MaintenanceReportTabProps {
  maintenanceItems: MaintenanceReportItem[];
  departments: DepartmentResponse[];
  loading: boolean;
  filters: MaintenanceFilters;
  onFilterChange: (filters: MaintenanceFilters) => void;
}

export const initialMaintenanceFilters: MaintenanceFilters = {
  department: "all",
  category: "all",
  technician: "all",
  priority: "all",
  status: "all",
  search: "",
};

export const MaintenanceReportTab: React.FC<MaintenanceReportTabProps> = ({
  maintenanceItems,
  departments,
  loading,
  filters,
  onFilterChange,
}) => {
  // Dynamic options derived from live data
  const availableDepartments = useMemo(() => {
    const list = departments.map((d) => d.name);
    maintenanceItems.forEach((m) => {
      if (m.departmentName && !list.includes(m.departmentName)) list.push(m.departmentName);
    });
    return Array.from(new Set(list));
  }, [departments, maintenanceItems]);

  const availableTechnicians = useMemo(() => {
    const list = maintenanceItems
      .map((m) => m.technicianName)
      .filter((t) => t && t !== "Unassigned" && t !== "Pending Assignment");
    return Array.from(new Set(list));
  }, [maintenanceItems]);

  const availablePriorities = useMemo(() => {
    return Array.from(new Set(maintenanceItems.map((m) => m.priority).filter(Boolean)));
  }, [maintenanceItems]);

  const availableStatuses = useMemo(() => {
    return Array.from(new Set(maintenanceItems.map((m) => m.status).filter(Boolean)));
  }, [maintenanceItems]);

  const handleFilterUpdate = (key: keyof MaintenanceFilters, val: string) => {
    onFilterChange({ ...filters, [key]: val });
  };

  const handleClearFilters = () => {
    onFilterChange({ ...initialMaintenanceFilters });
  };

  const hasActiveFilters =
    filters.department !== "all" ||
    filters.category !== "all" ||
    filters.technician !== "all" ||
    filters.priority !== "all" ||
    filters.status !== "all" ||
    Boolean(filters.search.trim());

  // Filtered maintenance items
  const filteredItems = useMemo(() => {
    return maintenanceItems.filter((item) => {
      if (filters.department !== "all" && item.departmentName !== filters.department) {
        return false;
      }
      if (filters.category !== "all" && item.category !== filters.category) {
        return false;
      }
      if (filters.technician !== "all" && item.technicianName !== filters.technician) {
        return false;
      }
      if (filters.priority !== "all" && item.priority !== filters.priority) {
        return false;
      }
      if (filters.status !== "all" && item.status !== filters.status) {
        return false;
      }
      if (filters.search.trim()) {
        const q = filters.search.toLowerCase();
        const matchCode = item.workOrderCode?.toLowerCase().includes(q);
        const matchAsset = item.assetName?.toLowerCase().includes(q);
        const matchAssetCode = item.assetCode?.toLowerCase().includes(q);
        const matchTitle = item.issueTitle?.toLowerCase().includes(q);
        const matchTech = item.technicianName?.toLowerCase().includes(q);
        if (!matchCode && !matchAsset && !matchAssetCode && !matchTitle && !matchTech) return false;
      }
      return true;
    });
  }, [maintenanceItems, filters]);

  // Aggregation A: Maintenance by Status
  const statusChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredItems.forEach((i) => {
      const st = i.status || "REPORTED";
      counts[st] = (counts[st] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({
      name: name.replace(/_/g, " "),
      count,
    }));
  }, [filteredItems]);

  // Aggregation B: Maintenance by Priority
  const priorityChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredItems.forEach((i) => {
      const p = i.priority || "MEDIUM";
      counts[p] = (counts[p] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
    }));
  }, [filteredItems]);

  // Aggregation C: Technician Workload Matrix (Technician × Status dimensions)
  const matrixData = useMemo(() => {
    const techs =
      availableTechnicians.length > 0 ? availableTechnicians : ["Pending Dispatch"];
    const columns: MatrixColumn[] = [
      { key: "assigned", label: "Assigned / Pending" },
      { key: "inProgress", label: "In Progress" },
      { key: "completed", label: "Completed" },
    ];

    const rows: MatrixRow[] = [];
    const columnTotals = { assigned: 0, inProgress: 0, completed: 0 };
    let grandTotal = 0;

    techs.forEach((tech) => {
      const techItems = filteredItems.filter((i) => i.technicianName === tech);

      const assignedCount = techItems.filter(
        (i) => i.status === "ASSIGNED" || i.status === "PENDING_ACCEPTANCE" || i.status === "ACCEPTED"
      ).length;
      const inProgressCount = techItems.filter((i) => i.status === "IN_PROGRESS").length;
      const completedCount = techItems.filter(
        (i) => i.status === "COMPLETED" || i.status === "RESOLVED" || i.status === "RESOLVED_REPAIRED"
      ).length;

      const total = assignedCount + inProgressCount + completedCount;
      if (total > 0 || !hasActiveFilters) {
        rows.push({
          id: tech,
          label: tech,
          values: {
            assigned: assignedCount,
            inProgress: inProgressCount,
            completed: completedCount,
          },
          total,
        });
        columnTotals.assigned += assignedCount;
        columnTotals.inProgress += inProgressCount;
        columnTotals.completed += completedCount;
        grandTotal += total;
      }
    });

    return { columns, rows, columnTotals, grandTotal };
  }, [filteredItems, availableTechnicians, hasActiveFilters]);

  // Detailed Table Columns
  const columns: Column<MaintenanceReportItem>[] = [
    {
      key: "workOrderCode",
      header: "Work Order / Code",
      sortable: true,
      className: "font-mono font-semibold text-[#2E8540] dark:text-[#A3FF5F]",
      render: (i) => i.workOrderCode,
    },
    {
      key: "assetName",
      header: "Asset",
      sortable: true,
      render: (i) => (
        <div>
          <span className="font-semibold text-xs text-[#1A1D18] dark:text-[#F3F7F4] block truncate max-w-[180px]">
            {i.assetName}
          </span>
          <span className="text-[11px] font-mono text-[#74827A] dark:text-[#6C7B73]">{i.assetCode}</span>
        </div>
      ),
    },
    {
      key: "issueTitle",
      header: "Issue Description",
      sortable: true,
      render: (i) => (
        <span className="text-xs text-[#526159] dark:text-[#8E9C94] line-clamp-1 max-w-[220px]">
          {i.issueTitle}
        </span>
      ),
    },
    {
      key: "technicianName",
      header: "Assigned Technician",
      sortable: true,
      render: (i) => (
        <span className="text-xs font-mono text-[#1A1D18] dark:text-[#F3F7F4]">
          {i.technicianName}
        </span>
      ),
    },
    {
      key: "priority",
      header: "Priority",
      sortable: true,
      render: (i) => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
            i.priority === "CRITICAL"
              ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900"
              : i.priority === "HIGH"
              ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900"
              : "bg-[#F4F6F4] dark:bg-[#151C18] text-[#526159] dark:text-[#8E9C94] border border-[#E5E9E7] dark:border-[#25312B]"
          }`}
        >
          {i.priority}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (i) => <StatusBadge status={i.status} size="xs" />,
    },
    {
      key: "reportedAt",
      header: "Reported At",
      sortable: true,
      render: (i) => (
        <span className="text-xs font-mono text-[#74827A] dark:text-[#6C7B73]">
          {formatDate(i.reportedAt)}
        </span>
      ),
    },
    {
      key: "completedAt",
      header: "Completed At",
      sortable: true,
      render: (i) => (
        <span className="text-xs font-mono text-[#74827A] dark:text-[#6C7B73]">
          {i.completedAt ? formatDate(i.completedAt) : "— In Progress"}
        </span>
      ),
    },
  ];

  const handleExportCsv = () => {
    const headers = [
      "Work Order Code",
      "Asset Name",
      "Asset Code",
      "Issue Description",
      "Technician",
      "Priority",
      "Status",
      "Reported At",
      "Completed At",
    ];

    const rows = filteredItems.map((i) => [
      i.workOrderCode,
      i.assetName,
      i.assetCode,
      i.issueTitle,
      i.technicianName,
      i.priority,
      i.status,
      i.reportedAt || "",
      i.completedAt || "",
    ]);

    exportToCsv(`opspilot_maintenance_report_${Date.now()}`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Control / Filter Bar */}
      <div className="space-y-3 bg-white dark:bg-[#0D1511] p-4 rounded-xl border border-[#E5E9E7] dark:border-[#1E2B23] shadow-sm dark:shadow-card">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <FilterBar
            searchQuery={filters.search}
            onSearchChange={(val) => handleFilterUpdate("search", val)}
            searchPlaceholder="Search work order, issue, technician, asset..."
            className="w-full lg:max-w-md"
          />

          <div className="flex items-center gap-2 flex-wrap justify-end">
            <SavedViewsDropdown
              tabId="maintenance"
              currentFilters={filters}
              onApplyFilters={onFilterChange}
              availableOptions={{
                departments: availableDepartments,
                technicians: availableTechnicians,
                statuses: availableStatuses,
              }}
            />

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              disabled={filteredItems.length === 0}
              icon={<Download size={14} />}
            >
              Export CSV ({filteredItems.length})
            </Button>
          </div>
        </div>

        {/* Compact Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-[#E5E9E7] dark:border-[#18221D]">
          <div>
            <label className="text-[10px] font-mono uppercase text-[#74827A] dark:text-[#6C7B73] block mb-1">
              Technician
            </label>
            <select
              value={filters.technician}
              onChange={(e) => handleFilterUpdate("technician", e.target.value)}
              className="w-full h-8 px-2 text-xs rounded-lg bg-[#F8FAF9] dark:bg-[#111714] border border-[#E5E9E7] dark:border-[#25312B] text-[#1A1D18] dark:text-[#F3F7F4] focus:outline-none focus:border-[#2E8540] dark:focus:border-[#A3FF5F]"
            >
              <option value="all">All Technicians</option>
              {availableTechnicians.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase text-[#74827A] dark:text-[#6C7B73] block mb-1">
              Priority
            </label>
            <select
              value={filters.priority}
              onChange={(e) => handleFilterUpdate("priority", e.target.value)}
              className="w-full h-8 px-2 text-xs rounded-lg bg-[#F8FAF9] dark:bg-[#111714] border border-[#E5E9E7] dark:border-[#25312B] text-[#1A1D18] dark:text-[#F3F7F4] focus:outline-none focus:border-[#2E8540] dark:focus:border-[#A3FF5F]"
            >
              <option value="all">All Priorities</option>
              {availablePriorities.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase text-[#74827A] dark:text-[#6C7B73] block mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterUpdate("status", e.target.value)}
              className="w-full h-8 px-2 text-xs rounded-lg bg-[#F8FAF9] dark:bg-[#111714] border border-[#E5E9E7] dark:border-[#25312B] text-[#1A1D18] dark:text-[#F3F7F4] focus:outline-none focus:border-[#2E8540] dark:focus:border-[#A3FF5F]"
            >
              <option value="all">All Statuses</option>
              {availableStatuses.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase text-[#74827A] dark:text-[#6C7B73] block mb-1">
              Department
            </label>
            <select
              value={filters.department}
              onChange={(e) => handleFilterUpdate("department", e.target.value)}
              className="w-full h-8 px-2 text-xs rounded-lg bg-[#F8FAF9] dark:bg-[#111714] border border-[#E5E9E7] dark:border-[#25312B] text-[#1A1D18] dark:text-[#F3F7F4] focus:outline-none focus:border-[#2E8540] dark:focus:border-[#A3FF5F]"
            >
              <option value="all">All Departments</option>
              {availableDepartments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-[#E5E9E7] dark:border-[#18221D] text-xs">
            <span className="font-mono text-2xs text-[#74827A] dark:text-[#6C7B73]">
              Active filters applied • Showing {filteredItems.length} of {maintenanceItems.length} maintenance records
            </span>
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-xs font-medium text-[#2E8540] dark:text-[#A3FF5F] hover:underline flex items-center gap-1"
            >
              <RotateCcw size={12} /> Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* Analytical Visualizations */}
      {filteredItems.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Maintenance Status Bar Chart */}
          <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#0D1511] border border-[#E5E9E7] dark:border-[#1E2B23] shadow-sm dark:shadow-card space-y-3">
            <div className="border-b border-[#E5E9E7] dark:border-[#18221D] pb-2">
              <h3 className="font-heading font-semibold text-xs text-[#1A1D18] dark:text-[#F3F7F4] uppercase tracking-wider">
                Maintenance by Workflow Status
              </h3>
              <p className="text-2xs text-[#526159] dark:text-[#8E9C94]">Active work order progress across maintenance phases</p>
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusChartData} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E9E7" className="dark:stroke-[#25312B]" vertical={false} opacity={0.6} />
                  <XAxis dataKey="name" stroke="#74827A" fontSize={10} tickLine={false} />
                  <YAxis stroke="#74827A" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0D1511",
                      borderColor: "#1E2B23",
                      borderRadius: "8px",
                      fontSize: "11px",
                      color: "#F3F7F4",
                    }}
                  />
                  <Bar dataKey="count" fill="#D97706" className="dark:fill-[#F59E0B]" radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Maintenance Priority Distribution */}
          <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#0D1511] border border-[#E5E9E7] dark:border-[#1E2B23] shadow-sm dark:shadow-card space-y-3">
            <div className="border-b border-[#E5E9E7] dark:border-[#18221D] pb-2">
              <h3 className="font-heading font-semibold text-xs text-[#1A1D18] dark:text-[#F3F7F4] uppercase tracking-wider">
                Work Orders by Priority
              </h3>
              <p className="text-2xs text-[#526159] dark:text-[#8E9C94]">Urgency triage distribution of reported hardware failures</p>
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityChartData} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E9E7" className="dark:stroke-[#25312B]" vertical={false} opacity={0.6} />
                  <XAxis dataKey="name" stroke="#74827A" fontSize={11} tickLine={false} />
                  <YAxis stroke="#74827A" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0D1511",
                      borderColor: "#1E2B23",
                      borderRadius: "8px",
                      fontSize: "11px",
                      color: "#F3F7F4",
                    }}
                  />
                  <Bar dataKey="count" fill="#2E8540" className="dark:fill-[#A3FF5F]" radius={[4, 4, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Analytical Technician Workload Matrix */}
      {filteredItems.length > 0 && (
        <ReportMatrixTable
          title="Technician Workload Matrix"
          subtitle="Work order distribution and completion ratios across field service technicians"
          rowHeaderTitle="Technician"
          columns={matrixData.columns}
          rows={matrixData.rows}
          columnTotals={matrixData.columnTotals}
          grandTotal={matrixData.grandTotal}
        />
      )}

      {/* Detailed Maintenance Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-heading font-semibold text-xs text-[#1A1D18] dark:text-[#F3F7F4] uppercase tracking-wider">
            Detailed Maintenance & Repair Records ({filteredItems.length})
          </h3>
        </div>

        {filteredItems.length === 0 ? (
          <EmptyState
            variant={hasActiveFilters ? "filtered" : "scope"}
            message={
              hasActiveFilters
                ? "No maintenance or repair records matched your selected filters. Try broadening or clearing your filter criteria."
                : "No maintenance issue records are currently available within your authorized organizational scope."
            }
            action={
              hasActiveFilters ? (
                <Button variant="outline" size="sm" onClick={handleClearFilters}>
                  Clear All Filters
                </Button>
              ) : undefined
            }
          />
        ) : (
          <DataTable
            data={filteredItems}
            columns={columns}
            loading={loading}
            pageSize={10}
            keyExtractor={(i) => i.id}
          />
        )}
      </div>
    </div>
  );
};
