import React, { useMemo } from "react";
import { Download, Users, Package, RotateCcw } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { CustodyRecord, AllocationsFilters } from "../types";
import type { AssetResponse } from "../../../types/asset";
import type { DepartmentResponse } from "../../../types/department";
import type { EmployeeResponse } from "../../../types/employee";
import { DataTable, type Column } from "../../../components/ui/DataTable";
import { FilterBar } from "../../../components/ui/FilterBar";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { Button } from "../../../components/ui/Button";
import EmptyState from "../../../components/common/EmptyState";
import { ReportMatrixTable, type MatrixColumn, type MatrixRow } from "../components/ReportMatrixTable";
import { SavedViewsDropdown } from "../components/SavedViewsDropdown";
import { exportToCsv, cleanDepartmentName } from "../utils/reportUtils";
import { formatDate } from "../../../utils/formatDate";

export interface AllocationsTabProps {
  custodyRecords: CustodyRecord[];
  assets: AssetResponse[];
  departments: DepartmentResponse[];
  employees: EmployeeResponse[];
  loading: boolean;
  filters: AllocationsFilters;
  onFilterChange: (filters: AllocationsFilters) => void;
}

export const initialAllocationsFilters: AllocationsFilters = {
  department: "all",
  employee: "all",
  category: "all",
  status: "all",
  search: "",
};

export const AllocationsTab: React.FC<AllocationsTabProps> = ({
  custodyRecords,
  assets,
  departments,
  employees,
  loading,
  filters,
  onFilterChange,
}) => {
  // Extract dynamic options
  const availableDepartments = useMemo(() => {
    const list: string[] = [];
    departments.forEach((d) => {
      const c = cleanDepartmentName(d.name);
      if (c && !list.includes(c)) list.push(c);
    });
    custodyRecords.forEach((c) => {
      const cd = cleanDepartmentName(c.department);
      if (cd && !list.includes(cd)) list.push(cd);
    });
    return Array.from(new Set(list));
  }, [departments, custodyRecords]);

  const availableEmployees = useMemo(() => {
    const list = employees.map((e) => `${e.firstName} ${e.lastName}`.trim());
    custodyRecords.forEach((c) => {
      if (c.assignedTo && !list.includes(c.assignedTo) && c.assignedTo !== "Unassigned") {
        list.push(c.assignedTo);
      }
    });
    return Array.from(new Set(list));
  }, [employees, custodyRecords]);

  const availableCategories = useMemo(() => {
    return Array.from(new Set(custodyRecords.map((c) => c.category).filter(Boolean)));
  }, [custodyRecords]);

  const availableStatuses = useMemo(() => {
    return Array.from(new Set(custodyRecords.map((c) => c.status).filter(Boolean)));
  }, [custodyRecords]);

  const handleFilterUpdate = (key: keyof AllocationsFilters, val: string) => {
    onFilterChange({ ...filters, [key]: val });
  };

  const handleClearFilters = () => {
    onFilterChange({ ...initialAllocationsFilters });
  };

  const hasActiveFilters =
    filters.department !== "all" ||
    filters.employee !== "all" ||
    filters.category !== "all" ||
    filters.status !== "all" ||
    Boolean(filters.search.trim());

  // Filtered custody records
  const filteredRecords = useMemo(() => {
    return custodyRecords.filter((record) => {
      if (filters.department !== "all" && cleanDepartmentName(record.department) !== filters.department) {
        return false;
      }
      if (filters.employee !== "all" && record.assignedTo !== filters.employee) {
        return false;
      }
      if (filters.category !== "all" && record.category !== filters.category) {
        return false;
      }
      if (filters.status !== "all" && record.status !== filters.status) {
        return false;
      }
      if (filters.search.trim()) {
        const q = filters.search.toLowerCase();
        const matchEmp = record.assignedTo.toLowerCase().includes(q);
        const matchDept = cleanDepartmentName(record.department).toLowerCase().includes(q);
        const matchAsset = record.assetName.toLowerCase().includes(q);
        const matchCode = record.assetCode.toLowerCase().includes(q);
        if (!matchEmp && !matchDept && !matchAsset && !matchCode) return false;
      }
      return true;
    });
  }, [custodyRecords, filters]);

  // Aggregation A: Allocation by Department
  const departmentChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredRecords.forEach((r) => {
      const dept = cleanDepartmentName(r.department);
      counts[dept] = (counts[dept] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [filteredRecords]);

  // Aggregation B: Status breakdown
  const statusChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredRecords.forEach((r) => {
      const st = r.status || "ASSIGNED";
      counts[st] = (counts[st] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({
      name: name.replace(/_/g, " "),
      count,
    }));
  }, [filteredRecords]);

  // Aggregation C: Allocation Matrix (Department × Assigned / Unassigned / Total)
  const matrixData = useMemo(() => {
    const depts = availableDepartments.length > 0 ? availableDepartments : ["General"];
    const columns: MatrixColumn[] = [
      { key: "assigned", label: "Assigned" },
      { key: "unassigned", label: "Unassigned" },
    ];

    const rows: MatrixRow[] = [];
    const columnTotals = { assigned: 0, unassigned: 0 };
    let grandTotal = 0;

    depts.forEach((dept) => {
      const assignedCount = filteredRecords.filter((r) => cleanDepartmentName(r.department) === dept).length;
      const unassignedCount = assets.filter(
        (a) => cleanDepartmentName(a.departmentName) === dept && a.status === "AVAILABLE"
      ).length;

      const total = assignedCount + unassignedCount;
      if (total > 0 || !hasActiveFilters) {
        rows.push({
          id: dept,
          label: dept,
          values: {
            assigned: assignedCount,
            unassigned: unassignedCount,
          },
          total,
        });
        columnTotals.assigned += assignedCount;
        columnTotals.unassigned += unassignedCount;
        grandTotal += total;
      }
    });

    return { columns, rows, columnTotals, grandTotal };
  }, [filteredRecords, assets, availableDepartments, hasActiveFilters]);

  // Detailed Table Columns (Person / Custody-First)
  const columns: Column<CustodyRecord>[] = [
    {
      key: "assignedTo",
      header: "Assigned To (Custodian)",
      sortable: true,
      render: (r) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#E8F8EE] dark:bg-[#14261B] text-[#1E6B30] dark:text-[#A3FF5F] flex items-center justify-center font-bold text-[10px] shrink-0">
            {r.assignedTo.charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="font-semibold text-xs text-[#1A1D18] dark:text-[#F3F7F4] block">
              {r.assignedTo}
            </span>
            <span className="text-[10px] font-mono text-[#74827A] dark:text-[#6C7B73]">{r.department}</span>
          </div>
        </div>
      ),
    },
    {
      key: "department",
      header: "Department",
      sortable: true,
      render: (r) => <span className="text-xs text-[#526159] dark:text-[#8E9C94]">{r.department}</span>,
    },
    {
      key: "assetName",
      header: "Asset",
      sortable: true,
      render: (r) => (
        <div>
          <span className="font-medium text-xs text-[#1A1D18] dark:text-[#F3F7F4] block">{r.assetName}</span>
          <span className="text-[11px] font-mono text-[#2E8540] dark:text-[#A3FF5F]">{r.assetCode}</span>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      sortable: true,
      render: (r) => (
        <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#F4F6F4] dark:bg-[#151C18] border border-[#E5E9E7] dark:border-[#25312B] text-[#526159] dark:text-[#8E9C94]">
          {r.category}
        </span>
      ),
    },
    {
      key: "assignedDate",
      header: "Assigned Date",
      sortable: true,
      render: (r) => (
        <span className="text-xs font-mono text-[#74827A] dark:text-[#6C7B73]">
          {formatDate(r.assignedDate)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Custody Status",
      sortable: true,
      render: (r) => <StatusBadge status={r.status} size="xs" />,
    },
  ];

  const handleExportCsv = () => {
    const headers = [
      "Custodian",
      "Department",
      "Asset Name",
      "Asset Code",
      "Category",
      "Assigned Date",
      "Custody Status",
    ];

    const rows = filteredRecords.map((r) => [
      r.assignedTo,
      r.department,
      r.assetName,
      r.assetCode,
      r.category,
      r.assignedDate || "",
      r.status,
    ]);

    exportToCsv(`opspilot_allocations_report_${Date.now()}`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Control / Filter Bar */}
      <div className="space-y-3 bg-white dark:bg-[#0D1511] p-4 rounded-xl border border-[#E5E9E7] dark:border-[#1E2B23] shadow-sm dark:shadow-card">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <FilterBar
            searchQuery={filters.search}
            onSearchChange={(val) => handleFilterUpdate("search", val)}
            searchPlaceholder="Search custodian, asset, department, code..."
            className="w-full lg:max-w-md"
          />

          <div className="flex items-center gap-2 flex-wrap justify-end">
            <SavedViewsDropdown
              tabId="allocations"
              currentFilters={filters}
              onApplyFilters={onFilterChange}
              availableOptions={{
                departments: availableDepartments,
                categories: availableCategories,
                technicians: availableEmployees,
                statuses: availableStatuses,
              }}
            />

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              disabled={filteredRecords.length === 0}
              icon={<Download size={14} />}
            >
              Export CSV ({filteredRecords.length})
            </Button>
          </div>
        </div>

        {/* Compact Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-[#E5E9E7] dark:border-[#18221D]">
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

          <div>
            <label className="text-[10px] font-mono uppercase text-[#74827A] dark:text-[#6C7B73] block mb-1">
              Employee (Custodian)
            </label>
            <select
              value={filters.employee}
              onChange={(e) => handleFilterUpdate("employee", e.target.value)}
              className="w-full h-8 px-2 text-xs rounded-lg bg-[#F8FAF9] dark:bg-[#111714] border border-[#E5E9E7] dark:border-[#25312B] text-[#1A1D18] dark:text-[#F3F7F4] focus:outline-none focus:border-[#2E8540] dark:focus:border-[#A3FF5F]"
            >
              <option value="all">All Employees</option>
              {availableEmployees.map((emp) => (
                <option key={emp} value={emp}>
                  {emp}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase text-[#74827A] dark:text-[#6C7B73] block mb-1">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterUpdate("category", e.target.value)}
              className="w-full h-8 px-2 text-xs rounded-lg bg-[#F8FAF9] dark:bg-[#111714] border border-[#E5E9E7] dark:border-[#25312B] text-[#1A1D18] dark:text-[#F3F7F4] focus:outline-none focus:border-[#2E8540] dark:focus:border-[#A3FF5F]"
            >
              <option value="all">All Categories</option>
              {availableCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase text-[#74827A] dark:text-[#6C7B73] block mb-1">
              Custody Status
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
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-[#E5E9E7] dark:border-[#18221D] text-xs">
            <span className="font-mono text-2xs text-[#74827A] dark:text-[#6C7B73]">
              Active filters applied • Showing {filteredRecords.length} of {custodyRecords.length} custody assignments
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
      {filteredRecords.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Custody by Department Bar */}
          <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#0D1511] border border-[#E5E9E7] dark:border-[#1E2B23] shadow-sm dark:shadow-card space-y-3">
            <div className="border-b border-[#E5E9E7] dark:border-[#18221D] pb-2">
              <h3 className="font-heading font-semibold text-xs text-[#1A1D18] dark:text-[#F3F7F4] uppercase tracking-wider">
                Custody by Department
              </h3>
              <p className="text-2xs text-[#526159] dark:text-[#8E9C94]">Hardware possession breakdown across organizational divisions</p>
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentChartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E9E7" className="dark:stroke-[#25312B]" horizontal={false} opacity={0.6} />
                  <XAxis type="number" stroke="#74827A" fontSize={10} tickLine={false} />
                  <YAxis type="category" dataKey="name" stroke="#74827A" fontSize={11} tickLine={false} width={90} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0D1511",
                      borderColor: "#1E2B23",
                      borderRadius: "8px",
                      fontSize: "11px",
                      color: "#F3F7F4",
                    }}
                  />
                  <Bar dataKey="count" fill="#2E8540" className="dark:fill-[#A3FF5F]" radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Assignment Status Distribution */}
          <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#0D1511] border border-[#E5E9E7] dark:border-[#1E2B23] shadow-sm dark:shadow-card space-y-3">
            <div className="border-b border-[#E5E9E7] dark:border-[#18221D] pb-2">
              <h3 className="font-heading font-semibold text-xs text-[#1A1D18] dark:text-[#F3F7F4] uppercase tracking-wider">
                Assignment Status Breakdown
              </h3>
              <p className="text-2xs text-[#526159] dark:text-[#8E9C94]">Active custody vs returned allocation volume</p>
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusChartData} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
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
                  <Bar dataKey="count" fill="#0D9488" className="dark:fill-[#55D6BE]" radius={[4, 4, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Analytical Allocation Matrix (Assigned vs Unassigned) */}
      {filteredRecords.length > 0 && (
        <ReportMatrixTable
          title="Department Allocation Matrix"
          subtitle="Assigned active equipment in custody vs unassigned available inventory"
          rowHeaderTitle="Department"
          columns={matrixData.columns}
          rows={matrixData.rows}
          columnTotals={matrixData.columnTotals}
          grandTotal={matrixData.grandTotal}
        />
      )}

      {/* Detailed Custody Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-heading font-semibold text-xs text-[#1A1D18] dark:text-[#F3F7F4] uppercase tracking-wider">
            Custody & Allocation Records ({filteredRecords.length})
          </h3>
        </div>

        {filteredRecords.length === 0 ? (
          <EmptyState
            variant={hasActiveFilters ? "filtered" : "scope"}
            message={
              hasActiveFilters
                ? "No custody allocation records matched your selected filters. Try broadening or clearing your filter criteria."
                : "No hardware custody records are currently available within your authorized organizational scope."
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
            data={filteredRecords}
            columns={columns}
            loading={loading}
            pageSize={10}
            keyExtractor={(r) => r.id}
          />
        )}
      </div>
    </div>
  );
};
