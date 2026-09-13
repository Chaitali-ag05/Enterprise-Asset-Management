import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Eye, Edit, AlertTriangle } from "lucide-react";
import { assetApi } from "../../api/assetApi";
import type { AssetResponse } from "../../types/asset";
import { useAuthStore } from "../../context/useAuthStore";
import { useNotifications } from "../../context/NotificationContext";
import { PageHeader } from "../../components/ui/PageHeader";
import { DataTable, type Column } from "../../components/ui/DataTable";
import { FilterBar } from "../../components/ui/FilterBar";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";
import { cleanDepartmentName } from "../reports/utils/reportUtils";

export default function AssetListPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { employeeId, loading: empLoading } = useNotifications();
  const [assets, setAssets] = useState<AssetResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

  const isEmployee = user?.role === "ROLE_EMPLOYEE";
  const isTechnician = user?.role === "ROLE_TECHNICIAN";
  const isPersonalScope = isEmployee || isTechnician;
  const canCreateEdit = ["ROLE_ADMIN", "ROLE_MANAGER"].includes(user?.role || "");

  useEffect(() => {
    if (!empLoading) {
      fetchAssets();
    }
  }, [user, employeeId, empLoading]);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      setError("");
      
      let data: AssetResponse[] = [];
      if (isPersonalScope) {
        if (!employeeId) {
          setAssets([]);
          return;
        }
        data = await assetApi.getByEmployeeId(employeeId);
      } else {
        data = await assetApi.getAll();
      }

      setAssets(Array.isArray(data) ? data : (data as any).content || []);
    } catch (err: unknown) {
      setError("Failed to load inventory assets.");
    } finally {
      setLoading(false);
    }
  };

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const s = search.toLowerCase();
      const matchSearch =
        search === "" ||
        (asset.assetName && asset.assetName.toLowerCase().includes(s)) ||
        (asset.assetCode && asset.assetCode.toLowerCase().includes(s)) ||
        (asset.serialNumber && asset.serialNumber.toLowerCase().includes(s)) ||
        (asset.brand && asset.brand.toLowerCase().includes(s)) ||
        (asset.model && asset.model.toLowerCase().includes(s)) ||
        (asset.assignedEmployeeName && asset.assignedEmployeeName.toLowerCase().includes(s)) ||
        (asset.departmentName && asset.departmentName.toLowerCase().includes(s));

      const matchStatus = statusFilter === "ALL" || asset.status === statusFilter;
      const matchCategory = categoryFilter === "ALL" || asset.category === categoryFilter;

      return matchSearch && matchStatus && matchCategory;
    });
  }, [assets, search, statusFilter, categoryFilter]);

  const columns: Column<AssetResponse>[] = [
    {
      key: "assetCode",
      header: "ASSET ID",
      sortable: true,
      className: "w-32",
      render: (a) => (
        <span className="font-mono font-semibold text-sm text-[#2E8540] dark:text-[#A3FF5F]">
          {a.assetCode || `AST-${a.id.toString().padStart(4, "0")}`}
        </span>
      ),
    },
    {
      key: "assetName",
      header: "HARDWARE ASSET",
      sortable: true,
      render: (a) => (
        <div className="min-w-0">
          <Link
            to={`/assets/${a.id}`}
            className="font-semibold text-sm text-[#1A1D18] dark:text-[#F3F7F4] hover:text-[#2E8540] dark:hover:text-[#A3FF5F] transition-colors block truncate"
          >
            {a.assetName}
          </Link>
          <span className="text-xs text-[#526159] dark:text-[#87948C] block truncate">
            {a.brand} {a.model}
          </span>
        </div>
      ),
    },
    {
      key: "category",
      header: "CATEGORY",
      sortable: true,
      className: "w-28",
      render: (a) => (
        <span className="text-xs font-mono font-medium text-[#1A1D18] dark:text-[#C0CCC5] bg-[#F4F6F4] dark:bg-[#151C18] border border-[#E5E9E7] dark:border-[#25312B] px-2 py-0.5 rounded">
          {a.category}
        </span>
      ),
    },
    {
      key: "assignedEmployeeName",
      header: "ASSIGNED TO",
      className: "w-36",
      render: (a) => (
        <span className="text-sm text-[#1A1D18] dark:text-[#F3F7F4] truncate block">
          {a.assignedEmployeeName || <span className="text-[#74827A] dark:text-[#59655E] italic">Unassigned</span>}
        </span>
      ),
    },
    {
      key: "departmentName",
      header: "DEPARTMENT",
      sortable: true,
      className: "w-32",
      render: (a) => (
        <span className="text-xs text-[#526159] dark:text-[#C0CCC5] truncate block">
          {cleanDepartmentName(a.departmentName)}
        </span>
      ),
    },
    {
      key: "status",
      header: "STATUS",
      sortable: true,
      className: "w-32",
      render: (a) => <StatusBadge status={a.status} size="sm" />,
    },
    {
      key: "serialNumber",
      header: "SERIAL NUMBER",
      className: "w-36",
      render: (a) => (
        <span className="font-mono text-xs text-[#526159] dark:text-[#87948C]">
          {a.serialNumber || "—"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right w-20",
      render: (a) => (
        <div className="flex items-center justify-end gap-1.5">
          <Link
            to={`/assets/${a.id}`}
            className="p-1.5 rounded-lg text-[#74827A] hover:text-[#1A1D18] dark:hover:text-[#F3F7F4] hover:bg-[#F4F6F4] dark:hover:bg-[#151C18] transition-colors"
            title="View Details"
          >
            <Eye size={15} />
          </Link>
          {canCreateEdit && (
            <Link
              to={`/assets/${a.id}/edit`}
              className="p-1.5 rounded-lg text-[#74827A] hover:text-[#2E8540] dark:hover:text-[#A3FF5F] hover:bg-[#F4F6F4] dark:hover:bg-[#151C18] transition-colors"
              title="Edit Asset"
            >
              <Edit size={15} />
            </Link>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title={isPersonalScope ? "My Assigned Hardware" : "Hardware Asset Registry"}
        description={isPersonalScope ? "IT devices, accessories, and peripherals currently assigned to your custody." : "Registered corporate devices, hardware specifications, and current assignment lifecycle."}
        actions={
          canCreateEdit && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate("/assets/new")}
              icon={<Plus size={14} />}
            >
              Register Asset
            </Button>
          )
        }
      />

      <FilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by tag, name, serial, brand, employee..."
        filters={
          <>
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-36"
            >
              <option value="ALL">All Categories</option>
              <option value="LAPTOP">Laptop</option>
              <option value="DESKTOP">Desktop</option>
              <option value="SERVER">Server</option>
              <option value="MONITOR">Monitor</option>
              <option value="PHONE">Phone</option>
              <option value="TABLET">Tablet</option>
              <option value="ACCESSORY">Accessory</option>
              <option value="OTHER">Other</option>
            </Select>

            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-40"
            >
              <option value="ALL">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="UNDER_MAINTENANCE">Under Maintenance</option>
              <option value="RETIRED">Retired</option>
              <option value="DAMAGED">Damaged</option>
            </Select>
          </>
        }
      />

      {error ? (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400 text-xs">
          <AlertTriangle size={16} />
          <p>{error}</p>
        </div>
      ) : (
        <DataTable
          data={filteredAssets}
          columns={columns}
          loading={loading}
          keyExtractor={(a) => a.id}
          pageSize={10}
          emptyMessage="No hardware assets found matching your active filter criteria."
        />
      )}
    </div>
  );
}