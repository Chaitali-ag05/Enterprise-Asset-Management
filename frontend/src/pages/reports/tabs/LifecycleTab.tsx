import React, { useMemo } from "react";
import { Download, Clock, AlertTriangle, RotateCcw } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { LifecycleAssetRecord, LifecycleFilters, AgeBand } from "../types";
import type { DepartmentResponse } from "../../../types/department";
import type { VendorResponse } from "../../../types/vendor";
import { DataTable, type Column } from "../../../components/ui/DataTable";
import { FilterBar } from "../../../components/ui/FilterBar";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { Button } from "../../../components/ui/Button";
import EmptyState from "../../../components/common/EmptyState";
import { ReportMatrixTable, type MatrixColumn, type MatrixRow } from "../components/ReportMatrixTable";
import { SavedViewsDropdown } from "../components/SavedViewsDropdown";
import { exportToCsv, cleanDepartmentName } from "../utils/reportUtils";
import { formatDate } from "../../../utils/formatDate";

export interface LifecycleTabProps {
  lifecycleAssets: LifecycleAssetRecord[];
  departments: DepartmentResponse[];
  vendors: VendorResponse[];
  loading: boolean;
  filters: LifecycleFilters;
  onFilterChange: (filters: LifecycleFilters) => void;
}

export const initialLifecycleFilters: LifecycleFilters = {
  department: "all",
  category: "all",
  vendor: "all",
  ageBand: "all",
  status: "all",
  search: "",
};

const CANONICAL_AGE_BANDS: AgeBand[] = ["0–<1 year", "1–<3 years", "3–<5 years", "5+ years"];

export const LifecycleTab: React.FC<LifecycleTabProps> = ({
  lifecycleAssets,
  departments,
  vendors,
  loading,
  filters,
  onFilterChange,
}) => {
  // Dynamic options derived from live records
  const availableDepartments = useMemo(() => {
    const list = departments.map((d) => cleanDepartmentName(d.name));
    lifecycleAssets.forEach((a) => {
      const clean = cleanDepartmentName(a.departmentName);
      if (clean && !list.includes(clean)) list.push(clean);
    });
    return Array.from(new Set(list)).sort();
  }, [departments, lifecycleAssets]);

  const availableCategories = useMemo(() => {
    return Array.from(new Set(lifecycleAssets.map((a) => a.category).filter(Boolean)));
  }, [lifecycleAssets]);

  const availableVendors = useMemo(() => {
    const list = vendors.map((v) => v.name);
    lifecycleAssets.forEach((a) => {
      if (a.vendorName && !list.includes(a.vendorName)) list.push(a.vendorName);
    });
    return Array.from(new Set(list));
  }, [vendors, lifecycleAssets]);

  const availableStatuses = useMemo(() => {
    return Array.from(new Set(lifecycleAssets.map((a) => a.status).filter(Boolean)));
  }, [lifecycleAssets]);

  const handleFilterUpdate = (key: keyof LifecycleFilters, val: string) => {
    onFilterChange({ ...filters, [key]: val });
  };

  const handleClearFilters = () => {
    onFilterChange({ ...initialLifecycleFilters });
  };

  const hasActiveFilters =
    filters.department !== "all" ||
    filters.category !== "all" ||
    filters.vendor !== "all" ||
    filters.ageBand !== "all" ||
    filters.status !== "all" ||
    Boolean(filters.search.trim());

  // Filtered lifecycle dataset
  const filteredAssets = useMemo(() => {
    return lifecycleAssets.filter((asset) => {
      if (filters.department !== "all" && cleanDepartmentName(asset.departmentName) !== filters.department) {
        return false;
      }
      if (filters.category !== "all" && asset.category !== filters.category) {
        return false;
      }
      if (filters.vendor !== "all" && asset.vendorName !== filters.vendor) {
        return false;
      }
      if (filters.ageBand !== "all" && asset.ageBand !== filters.ageBand) {
        return false;
      }
      if (filters.status !== "all" && asset.status !== filters.status) {
        return false;
      }
      if (filters.search.trim()) {
        const q = filters.search.toLowerCase();
        const matchCode = asset.assetCode?.toLowerCase().includes(q);
        const matchName = asset.assetName?.toLowerCase().includes(q);
        const matchVendor = asset.vendorName?.toLowerCase().includes(q);
        const matchDept = cleanDepartmentName(asset.departmentName)?.toLowerCase().includes(q);
        if (!matchCode && !matchName && !matchVendor && !matchDept) return false;
      }
      return true;
    });
  }, [lifecycleAssets, filters]);

  // Aggregation A: Age Band Distribution (Strict canonical non-overlapping bands)
  const ageBandChartData = useMemo(() => {
    return CANONICAL_AGE_BANDS.map((band) => {
      const count = filteredAssets.filter((a) => a.ageBand === band).length;
      return {
        name: band,
        count,
      };
    });
  }, [filteredAssets]);

  // Aggregation B: Aging Category Distribution (Older than 3 years)
  const agingCategoryChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredAssets
      .filter((a) => a.ageBand === "3–<5 years" || a.ageBand === "5+ years")
      .forEach((a) => {
        const cat = a.category || "General";
        counts[cat] = (counts[cat] || 0) + 1;
      });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [filteredAssets]);

  // Aggregation C: Age Band × Category Matrix
  const matrixData = useMemo(() => {
    const cats = availableCategories.length > 0 ? availableCategories : ["General"];
    const columns: MatrixColumn[] = CANONICAL_AGE_BANDS.map((band) => ({
      key: band,
      label: band,
    }));

    const rows: MatrixRow[] = [];
    const columnTotals: Record<string, number> = {};
    CANONICAL_AGE_BANDS.forEach((b) => (columnTotals[b] = 0));
    let grandTotal = 0;

    cats.forEach((cat) => {
      const rowValues: Record<string, number> = {};
      let rowTotal = 0;

      CANONICAL_AGE_BANDS.forEach((band) => {
        const count = filteredAssets.filter((a) => a.category === cat && a.ageBand === band).length;
        rowValues[band] = count;
        rowTotal += count;
        columnTotals[band] = (columnTotals[band] || 0) + count;
      });

      if (rowTotal > 0 || !hasActiveFilters) {
        rows.push({
          id: cat,
          label: cat,
          values: rowValues,
          total: rowTotal,
        });
        grandTotal += rowTotal;
      }
    });

    return { columns, rows, columnTotals, grandTotal };
  }, [filteredAssets, availableCategories, hasActiveFilters]);

  // Detailed Aging Table Columns
  const columns: Column<LifecycleAssetRecord>[] = [
    {
      key: "assetCode",
      header: "Asset ID",
      sortable: true,
      className: "font-mono font-semibold text-[#2E8540] dark:text-[#A3FF5F]",
      render: (a) => a.assetCode,
    },
    {
      key: "assetName",
      header: "Asset",
      sortable: true,
      render: (a) => (
        <div>
          <span className="font-semibold text-xs text-[#1A1D18] dark:text-[#F3F7F4] block truncate max-w-[180px]">
            {a.assetName}
          </span>
          <span className="text-[11px] font-mono text-[#74827A] dark:text-[#6C7B73]">
            {a.brand} {a.model}
          </span>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      sortable: true,
      render: (a) => (
        <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#F4F6F4] dark:bg-[#151C18] border border-[#E5E9E7] dark:border-[#25312B] text-[#526159] dark:text-[#8E9C94]">
          {a.category}
        </span>
      ),
    },
    {
      key: "vendorName",
      header: "Vendor",
      sortable: true,
      render: (a) => <span className="text-xs text-[#526159] dark:text-[#8E9C94]">{a.vendorName || "—"}</span>,
    },
    {
      key: "purchaseDate",
      header: "Purchase Date",
      sortable: true,
      render: (a) => (
        <span className="text-xs font-mono text-[#74827A] dark:text-[#6C7B73]">
          {formatDate(a.purchaseDate)}
        </span>
      ),
    },
    {
      key: "ageYears",
      header: "Asset Age",
      sortable: true,
      render: (a) => (
        <span className="font-mono font-bold text-xs text-[#1A1D18] dark:text-[#F3F7F4]">
          {a.ageYears !== null ? `${a.ageYears} yrs` : "—"}
        </span>
      ),
    },
    {
      key: "ageBand",
      header: "Age Band",
      sortable: true,
      className: "whitespace-nowrap",
      render: (a) => (
        <span
          className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold whitespace-nowrap inline-flex items-center justify-center tracking-tight select-none ${
            a.ageBand === "5+ years"
              ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900"
              : a.ageBand === "3–<5 years"
              ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900"
              : a.ageBand === "1–<3 years"
              ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900"
              : "bg-[#E8F8EE] dark:bg-[#14261B] text-[#1E6B30] dark:text-[#A3FF5F] border border-[#C2E8CE] dark:border-[#234A31]"
          }`}
        >
          {a.ageBand}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (a) => <StatusBadge status={a.status} size="xs" />,
    },
    {
      key: "assignedEmployeeName",
      header: "Assigned To",
      sortable: true,
      render: (a) => (
        <span className="text-xs font-mono text-[#526159] dark:text-[#8E9C94]">
          {a.assignedEmployeeName || "— Unassigned"}
        </span>
      ),
    },
  ];

  const handleExportCsv = () => {
    const headers = [
      "Asset ID",
      "Asset Name",
      "Brand",
      "Model",
      "Category",
      "Vendor",
      "Department",
      "Purchase Date",
      "Age (Years)",
      "Age Band",
      "Status",
      "Assigned To",
    ];

    const rows = filteredAssets.map((a) => [
      a.assetCode,
      a.assetName,
      a.brand,
      a.model,
      a.category,
      a.vendorName || "",
      cleanDepartmentName(a.departmentName) || "General",
      a.purchaseDate || "",
      a.ageYears !== null ? a.ageYears : "",
      a.ageBand,
      a.status,
      a.assignedEmployeeName || "Unassigned",
    ]);

    exportToCsv(`opspilot_lifecycle_report_${Date.now()}`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Control / Filter Bar */}
      <div className="space-y-3 bg-white dark:bg-[#0D1511] p-4 rounded-xl border border-[#E5E9E7] dark:border-[#1E2B23] shadow-sm dark:shadow-card">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <FilterBar
            searchQuery={filters.search}
            onSearchChange={(val) => handleFilterUpdate("search", val)}
            searchPlaceholder="Search aging assets, vendors, departments..."
            className="w-full lg:max-w-md"
          />

          <div className="flex items-center gap-2 flex-wrap justify-end">
            <SavedViewsDropdown
              tabId="lifecycle"
              currentFilters={filters}
              onApplyFilters={onFilterChange}
              availableOptions={{
                departments: availableDepartments,
                categories: availableCategories,
                vendors: availableVendors,
                statuses: availableStatuses,
              }}
            />

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              disabled={filteredAssets.length === 0}
              icon={<Download size={14} />}
            >
              Export CSV ({filteredAssets.length})
            </Button>
          </div>
        </div>

        {/* Compact Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 pt-2 border-t border-[#E5E9E7] dark:border-[#18221D]">
          <div>
            <label className="text-[10px] font-mono uppercase text-[#74827A] dark:text-[#6C7B73] block mb-1">
              Age Band
            </label>
            <select
              value={filters.ageBand}
              onChange={(e) => handleFilterUpdate("ageBand", e.target.value)}
              className="w-full h-8 px-2 text-xs rounded-lg bg-[#F8FAF9] dark:bg-[#111714] border border-[#E5E9E7] dark:border-[#25312B] text-[#1A1D18] dark:text-[#F3F7F4] focus:outline-none focus:border-[#2E8540] dark:focus:border-[#A3FF5F]"
            >
              <option value="all">All Age Bands</option>
              {CANONICAL_AGE_BANDS.map((b) => (
                <option key={b} value={b}>
                  {b}
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
              Vendor
            </label>
            <select
              value={filters.vendor}
              onChange={(e) => handleFilterUpdate("vendor", e.target.value)}
              className="w-full h-8 px-2 text-xs rounded-lg bg-[#F8FAF9] dark:bg-[#111714] border border-[#E5E9E7] dark:border-[#25312B] text-[#1A1D18] dark:text-[#F3F7F4] focus:outline-none focus:border-[#2E8540] dark:focus:border-[#A3FF5F]"
            >
              <option value="all">All Vendors</option>
              {availableVendors.map((v) => (
                <option key={v} value={v}>
                  {v}
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
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-[#E5E9E7] dark:border-[#18221D] text-xs">
            <span className="font-mono text-2xs text-[#74827A] dark:text-[#6C7B73]">
              Active filters applied • Showing {filteredAssets.length} of {lifecycleAssets.length} aging records
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
      {filteredAssets.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Age Band Distribution Bar */}
          <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#0D1511] border border-[#E5E9E7] dark:border-[#1E2B23] shadow-sm dark:shadow-card space-y-3">
            <div className="border-b border-[#E5E9E7] dark:border-[#18221D] pb-2">
              <h3 className="font-heading font-semibold text-xs text-[#1A1D18] dark:text-[#F3F7F4] uppercase tracking-wider">
                Asset Volume by Age Band
              </h3>
              <p className="text-2xs text-[#526159] dark:text-[#8E9C94]">Hardware lifespan brackets calculated from canonical purchase date</p>
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageBandChartData} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
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

          {/* Aging Assets by Category (>3 years) */}
          <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#0D1511] border border-[#E5E9E7] dark:border-[#1E2B23] shadow-sm dark:shadow-card space-y-3">
            <div className="border-b border-[#E5E9E7] dark:border-[#18221D] pb-2">
              <h3 className="font-heading font-semibold text-xs text-[#1A1D18] dark:text-[#F3F7F4] uppercase tracking-wider">
                Aging Assets by Category (&gt; 3 Years)
              </h3>
              <p className="text-2xs text-[#526159] dark:text-[#8E9C94]">Hardware reaching advanced operational lifecycle phases</p>
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={agingCategoryChartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
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
                  <Bar dataKey="count" fill="#D97706" className="dark:fill-[#F59E0B]" radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Analytical Age Band × Category Matrix */}
      {filteredAssets.length > 0 && (
        <ReportMatrixTable
          title="Age Band × Category Matrix"
          subtitle="Cross-tabulation of hardware age brackets categorized by equipment type"
          rowHeaderTitle="Category"
          columns={matrixData.columns}
          rows={matrixData.rows}
          columnTotals={matrixData.columnTotals}
          grandTotal={matrixData.grandTotal}
        />
      )}

      {/* Detailed Aging Assets Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-heading font-semibold text-xs text-[#1A1D18] dark:text-[#F3F7F4] uppercase tracking-wider">
            Detailed Lifecycle Records ({filteredAssets.length})
          </h3>
        </div>

        {filteredAssets.length === 0 ? (
          <EmptyState
            variant={hasActiveFilters ? "filtered" : "scope"}
            message={
              hasActiveFilters
                ? "No aging asset records matched your selected filters. Try broadening or clearing your filter criteria."
                : "No asset lifecycle records are currently available within your authorized organizational scope."
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
            data={filteredAssets}
            columns={columns}
            loading={loading}
            pageSize={10}
            keyExtractor={(a) => a.id}
          />
        )}
      </div>
    </div>
  );
};
