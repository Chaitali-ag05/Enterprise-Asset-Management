import React, { useState, useMemo } from "react";
import { Download, Layers, ShieldCheck, Building, Tag, Wrench, RotateCcw } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { AssetResponse } from "../../../types/asset";
import type { DepartmentResponse } from "../../../types/department";
import type { VendorResponse } from "../../../types/vendor";
import type { InventoryFilters } from "../types";
import { DataTable, type Column } from "../../../components/ui/DataTable";
import { FilterBar } from "../../../components/ui/FilterBar";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { Button } from "../../../components/ui/Button";
import { Select } from "../../../components/ui/Select";
import EmptyState from "../../../components/common/EmptyState";
import { ReportMatrixTable, type MatrixColumn, type MatrixRow } from "../components/ReportMatrixTable";
import { SavedViewsDropdown } from "../components/SavedViewsDropdown";
import { exportToCsv, getWarrantyStatus, cleanDepartmentName } from "../utils/reportUtils";
import { formatDate } from "../../../utils/formatDate";

export interface AssetInventoryTabProps {
  assets: AssetResponse[];
  departments: DepartmentResponse[];
  vendors: VendorResponse[];
  loading: boolean;
  filters: InventoryFilters;
  onFilterChange: (filters: InventoryFilters) => void;
}

export const initialInventoryFilters: InventoryFilters = {
  department: "all",
  category: "all",
  vendor: "all",
  status: "all",
  warrantyStatus: "all",
  search: "",
};

export const AssetInventoryTab: React.FC<AssetInventoryTabProps> = ({
  assets,
  departments,
  vendors,
  loading,
  filters,
  onFilterChange,
}) => {
  // Extract dynamic categories, vendors, and statuses from actual backend data
  const availableCategories = useMemo(() => {
    return Array.from(new Set(assets.map((a) => a.category).filter(Boolean)));
  }, [assets]);

  const availableDepartments = useMemo(() => {
    const list: string[] = [];
    departments.forEach((d) => {
      const c = cleanDepartmentName(d.name);
      if (c && !list.includes(c)) list.push(c);
    });
    assets.forEach((a) => {
      const c = cleanDepartmentName(a.departmentName);
      if (c && !list.includes(c)) list.push(c);
    });
    return Array.from(new Set(list));
  }, [departments, assets]);

  const availableVendors = useMemo(() => {
    const list = vendors.map((v) => v.name);
    assets.forEach((a) => {
      if (a.vendorName && !list.includes(a.vendorName)) list.push(a.vendorName);
    });
    return Array.from(new Set(list));
  }, [vendors, assets]);

  const availableStatuses = useMemo(() => {
    return Array.from(new Set(assets.map((a) => a.status).filter(Boolean)));
  }, [assets]);

  const handleFilterUpdate = (key: keyof InventoryFilters, val: string) => {
    onFilterChange({ ...filters, [key]: val });
  };

  const handleClearFilters = () => {
    onFilterChange({ ...initialInventoryFilters });
  };

  const hasActiveFilters =
    filters.department !== "all" ||
    filters.category !== "all" ||
    filters.vendor !== "all" ||
    filters.status !== "all" ||
    filters.warrantyStatus !== "all" ||
    Boolean(filters.search.trim());

  // Filtered dataset
  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      if (filters.department !== "all" && cleanDepartmentName(asset.departmentName) !== filters.department) {
        return false;
      }
      if (filters.category !== "all" && asset.category !== filters.category) {
        return false;
      }
      if (filters.vendor !== "all" && asset.vendorName !== filters.vendor) {
        return false;
      }
      if (filters.status !== "all" && asset.status !== filters.status) {
        return false;
      }
      if (filters.warrantyStatus !== "all") {
        const status = getWarrantyStatus(asset.warrantyExpiry);
        if (filters.warrantyStatus === "active" && status !== "Active") return false;
        if (filters.warrantyStatus === "expired" && status !== "Expired") return false;
      }
      if (filters.search.trim()) {
        const q = filters.search.toLowerCase();
        const matchCode = asset.assetCode?.toLowerCase().includes(q);
        const matchName = asset.assetName?.toLowerCase().includes(q);
        const matchSerial = asset.serialNumber?.toLowerCase().includes(q);
        const matchAssigned = asset.assignedEmployeeName?.toLowerCase().includes(q);
        if (!matchCode && !matchName && !matchSerial && !matchAssigned) return false;
      }
      return true;
    });
  }, [assets, filters]);

  // Aggregation A: Assets by Category
  const categoryChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredAssets.forEach((a) => {
      const cat = a.category || "Unassigned";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [filteredAssets]);

  // Aggregation B: Assets by Department (Clean department name aggregation)
  const departmentChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredAssets.forEach((a) => {
      const dept = cleanDepartmentName(a.departmentName);
      counts[dept] = (counts[dept] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [filteredAssets]);

  // Aggregation C: Department × Category Matrix
  const matrixData = useMemo(() => {
    const cats = availableCategories.length > 0 ? availableCategories : ["Equipment"];
    const depts = availableDepartments.length > 0 ? availableDepartments : ["General"];

    const columns: MatrixColumn[] = cats.map((c) => ({ key: c, label: c }));
    const rows: MatrixRow[] = [];
    const columnTotals: Record<string, number> = {};
    cats.forEach((c) => (columnTotals[c] = 0));
    let grandTotal = 0;

    depts.forEach((dept) => {
      const rowValues: Record<string, number> = {};
      let rowTotal = 0;

      cats.forEach((cat) => {
        const count = filteredAssets.filter(
          (a) => cleanDepartmentName(a.departmentName) === dept && (a.category || "Equipment") === cat
        ).length;
        rowValues[cat] = count;
        rowTotal += count;
        columnTotals[cat] = (columnTotals[cat] || 0) + count;
      });

      if (rowTotal > 0 || !hasActiveFilters) {
        rows.push({
          id: dept,
          label: dept,
          values: rowValues,
          total: rowTotal,
        });
        grandTotal += rowTotal;
      }
    });

    return { columns, rows, columnTotals, grandTotal };
  }, [filteredAssets, availableCategories, availableDepartments, hasActiveFilters]);

  // Detailed Table Columns
  const columns: Column<AssetResponse>[] = [
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
          <span className="font-semibold text-xs text-[#1A1D18] dark:text-[#F3F7F4] block truncate max-w-[200px]">
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
      key: "departmentName",
      header: "Department",
      sortable: true,
      render: (a) => <span className="text-xs font-medium text-[#1A1D18] dark:text-[#F3F7F4]">{cleanDepartmentName(a.departmentName)}</span>,
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
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (a) => <StatusBadge status={a.status} size="xs" />,
    },
    {
      key: "warrantyExpiry",
      header: "Warranty",
      sortable: true,
      render: (a) => {
        const st = getWarrantyStatus(a.warrantyExpiry);
        return (
          <div className="text-[11px] font-mono">
            <span className={st === "Active" ? "text-[#2E8540] dark:text-[#A3FF5F] font-semibold" : "text-[#74827A] dark:text-[#6C7B73]"}>
              {st}
            </span>
            {a.warrantyExpiry && (
              <span className="block text-[10px] text-[#74827A] dark:text-[#6C7B73]">
                {formatDate(a.warrantyExpiry)}
              </span>
            )}
          </div>
        );
      },
    },
  ];

  const handleExportCsv = () => {
    const headers = [
      "Asset ID",
      "Asset Name",
      "Brand",
      "Model",
      "Serial Number",
      "Category",
      "Vendor",
      "Department",
      "Assigned To",
      "Status",
      "Purchase Date",
      "Warranty Expiry",
      "Warranty Status",
    ];

    const rows = filteredAssets.map((a) => [
      a.assetCode,
      a.assetName,
      a.brand,
      a.model,
      a.serialNumber,
      a.category,
      a.vendorName || "",
      cleanDepartmentName(a.departmentName),
      a.assignedEmployeeName || "Unassigned",
      a.status,
      a.purchaseDate || "",
      a.warrantyExpiry || "",
      getWarrantyStatus(a.warrantyExpiry),
    ]);

    exportToCsv(`opspilot_asset_inventory_report_${Date.now()}`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Control / Filter Bar */}
      <div className="space-y-3 bg-white dark:bg-[#0D1511] p-4 rounded-xl border border-[#E5E9E7] dark:border-[#1E2B23] shadow-sm dark:shadow-card">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <FilterBar
            searchQuery={filters.search}
            onSearchChange={(val) => handleFilterUpdate("search", val)}
            searchPlaceholder="Search by ID, name, serial number, employee..."
            className="w-full lg:max-w-md"
          />

          <div className="flex items-center gap-2 flex-wrap justify-end">
            <SavedViewsDropdown
              tabId="inventory"
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

          <div>
            <label className="text-[10px] font-mono uppercase text-[#74827A] dark:text-[#6C7B73] block mb-1">
              Warranty
            </label>
            <select
              value={filters.warrantyStatus}
              onChange={(e) => handleFilterUpdate("warrantyStatus", e.target.value)}
              className="w-full h-8 px-2 text-xs rounded-lg bg-[#F8FAF9] dark:bg-[#111714] border border-[#E5E9E7] dark:border-[#25312B] text-[#1A1D18] dark:text-[#F3F7F4] focus:outline-none focus:border-[#2E8540] dark:focus:border-[#A3FF5F]"
            >
              <option value="all">All Warranties</option>
              <option value="active">Active Only</option>
              <option value="expired">Expired Only</option>
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-[#E5E9E7] dark:border-[#18221D] text-xs">
            <span className="font-mono text-2xs text-[#74827A] dark:text-[#6C7B73]">
              Active filters applied • Showing {filteredAssets.length} of {assets.length} assets
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
          {/* Category Distribution Horizontal Bar */}
          <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#0D1511] border border-[#E5E9E7] dark:border-[#1E2B23] shadow-sm dark:shadow-card space-y-3">
            <div className="border-b border-[#E5E9E7] dark:border-[#18221D] pb-2">
              <h3 className="font-heading font-semibold text-xs text-[#1A1D18] dark:text-[#F3F7F4] uppercase tracking-wider">
                Assets by Category
              </h3>
              <p className="text-2xs text-[#526159] dark:text-[#8E9C94]">Hardware classification volume in current filter scope</p>
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E9E7" className="dark:stroke-[#25312B]" horizontal={false} opacity={0.6} />
                  <XAxis type="number" stroke="#74827A" fontSize={10} tickLine={false} />
                  <YAxis type="category" dataKey="name" stroke="#74827A" fontSize={11} tickLine={false} width={85} />
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

          {/* Department Distribution Horizontal Bar */}
          <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#0D1511] border border-[#E5E9E7] dark:border-[#1E2B23] shadow-sm dark:shadow-card space-y-3">
            <div className="border-b border-[#E5E9E7] dark:border-[#18221D] pb-2">
              <h3 className="font-heading font-semibold text-xs text-[#1A1D18] dark:text-[#F3F7F4] uppercase tracking-wider">
                Assets by Department
              </h3>
              <p className="text-2xs text-[#526159] dark:text-[#8E9C94]">Hardware deployment across organizational business units</p>
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
                  <Bar dataKey="count" fill="#0D9488" className="dark:fill-[#55D6BE]" radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Analytical Department × Category Matrix */}
      {filteredAssets.length > 0 && (
        <ReportMatrixTable
          title="Department × Category Inventory Matrix"
          subtitle="Cross-tabulation of hardware models distributed across business cost centers"
          rowHeaderTitle="Department"
          columns={matrixData.columns}
          rows={matrixData.rows}
          columnTotals={matrixData.columnTotals}
          grandTotal={matrixData.grandTotal}
        />
      )}

      {/* Detailed Data Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-heading font-semibold text-xs text-[#1A1D18] dark:text-[#F3F7F4] uppercase tracking-wider">
            Detailed Inventory Records ({filteredAssets.length})
          </h3>
        </div>

        {filteredAssets.length === 0 ? (
          <EmptyState
            variant={hasActiveFilters ? "filtered" : "scope"}
            message={
              hasActiveFilters
                ? "No asset inventory records matched your selected filters. Try broadening or clearing your filter criteria."
                : "No asset inventory records are currently available within your authorized organizational scope."
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
