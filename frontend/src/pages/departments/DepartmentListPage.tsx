import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Building, AlertTriangle } from "lucide-react";
import { departmentService } from "../../api/departmentService";
import type { DepartmentResponse } from "../../types/department";
import { useAuthStore } from "../../context/useAuthStore";
import { useToast } from "../../context/ToastContext";
import { PageHeader } from "../../components/ui/PageHeader";
import { DataTable, type Column } from "../../components/ui/DataTable";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { Button } from "../../components/ui/Button";

export default function DepartmentListPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addToast } = useToast();
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isAdmin = user?.role === "ROLE_ADMIN";

  useEffect(() => {
    if (!isAdmin) {
      navigate("/dashboard");
      return;
    }
    fetchDepartments();
  }, [isAdmin]);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await departmentService.getAll();
      setDepartments(Array.isArray(data) ? data : (data as any).content || []);
    } catch (err) {
      setError("Failed to load departments.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete department "${name}"?`)) return;
    try {
      await departmentService.delete(id);
      addToast("success", "Department deleted.");
      fetchDepartments();
    } catch (err) {
      addToast("error", "Cannot delete department with active employees or assets.");
    }
  };

  const columns: Column<DepartmentResponse>[] = [
    {
      key: "name",
      header: "Department Name",
      sortable: true,
      render: (d) => (
        <div className="flex items-center gap-2">
          <Building size={14} className="text-[#2E8540] dark:text-[#A3FF5F] shrink-0" />
          <span className="font-semibold text-xs text-[#1A1D18] dark:text-white">{d.name}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (d) => <StatusBadge status={d.status || "ACTIVE"} size="xs" />,
    },
    {
      key: "actions",
      header: "",
      className: "text-right w-20",
      render: (d) => (
        <div className="flex items-center justify-end gap-1.5">
          <Link
            to={`/departments/${d.id}/edit`}
            className="p-1.5 rounded-lg text-[#74827A] hover:text-[#2E8540] dark:hover:text-[#A3FF5F] hover:bg-[#F4F6F4] dark:hover:bg-[#151C18] border border-transparent hover:border-[#E5E9E7] dark:hover:border-[#1E2B23] transition-colors"
            title="Edit Department"
          >
            <Edit size={14} />
          </Link>
          <button
            type="button"
            onClick={() => handleDelete(d.id, d.name)}
            className="p-1.5 rounded-lg text-[#74827A] hover:text-red-500 dark:hover:text-red-400 hover:bg-[#F4F6F4] dark:hover:bg-[#151C18] border border-transparent hover:border-[#E5E9E7] dark:hover:border-[#1E2B23] transition-colors"
            title="Delete Department"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Organizational Departments"
        description="Business cost centers, department divisions, and asset ownership mappings."
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate("/departments/new")}
            icon={<Plus size={14} />}
          >
            Add Department
          </Button>
        }
      />

      {error ? (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400 text-xs">
          <AlertTriangle size={16} />
          <p>{error}</p>
        </div>
      ) : (
        <DataTable
          data={departments}
          columns={columns}
          loading={loading}
          keyExtractor={(d) => d.id}
          pageSize={10}
          emptyMessage="No departments configured."
        />
      )}
    </div>
  );
}