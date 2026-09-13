import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Eye, Edit, AlertTriangle } from "lucide-react";
import { employeeApi } from "../../api/employeeApi";
import type { EmployeeResponse } from "../../types/employee";
import { useAuthStore } from "../../context/useAuthStore";
import { PageHeader } from "../../components/ui/PageHeader";
import { DataTable, type Column } from "../../components/ui/DataTable";
import { FilterBar } from "../../components/ui/FilterBar";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";

export default function EmployeeListPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [deptFilter, setDeptFilter] = useState("ALL");

  const isAdmin = user?.role === "ROLE_ADMIN";

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await employeeApi.getAll();
      setEmployees(Array.isArray(data) ? data : (data as any).content || []);
    } catch (err) {
      setError("Failed to load corporate employees directory.");
    } finally {
      setLoading(false);
    }
  };

  const departments = useMemo(() => {
    const set = new Set<string>();
    employees.forEach((e) => {
      if (e.departmentName) set.add(e.departmentName);
    });
    return Array.from(set);
  }, [employees]);

  const filtered = useMemo(() => {
    return employees.filter((emp) => {
      const s = search.toLowerCase();
      const matchSearch =
        search === "" ||
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(s) ||
        emp.email.toLowerCase().includes(s) ||
        (emp.employeeCode && emp.employeeCode.toLowerCase().includes(s)) ||
        (emp.departmentName && emp.departmentName.toLowerCase().includes(s)) ||
        (emp.designation && emp.designation.toLowerCase().includes(s));

      const matchStatus = statusFilter === "ALL" || emp.status === statusFilter;
      const matchDept = deptFilter === "ALL" || emp.departmentName === deptFilter;

      return matchSearch && matchStatus && matchDept;
    });
  }, [employees, search, statusFilter, deptFilter]);

  const columns: Column<EmployeeResponse>[] = [
    {
      key: "employeeCode",
      header: "Employee ID",
      sortable: true,
      render: (emp) => (
        <span className="font-mono text-xs font-semibold text-[#2E8540] dark:text-[#A3FF5F]">
          {emp.employeeCode || `EMP-${emp.id}`}
        </span>
      ),
    },
    {
      key: "name",
      header: "Employee Name & Email",
      sortable: true,
      render: (emp) => (
        <div>
          <Link
            to={`/employees/${emp.id}`}
            className="font-semibold text-xs text-[#1A1D18] dark:text-white hover:text-[#2E8540] dark:hover:text-[#A3FF5F] transition-colors block"
          >
            {emp.firstName} {emp.lastName}
          </Link>
          <span className="text-[11px] font-mono text-[#526159] dark:text-[#8E9C94] block mt-0.5">{emp.email}</span>
        </div>
      ),
    },
    {
      key: "departmentName",
      header: "Department",
      sortable: true,
      render: (emp) => (
        <span className="text-xs text-[#526159] dark:text-[#8E9C94] font-medium">
          {emp.departmentName || "Unassigned"}
        </span>
      ),
    },
    {
      key: "designation",
      header: "Designation",
      sortable: true,
      render: (emp) => (
        <span className="text-[11px] font-mono font-medium text-[#0D9488] dark:text-[#55D6BE] bg-[#E6F9F6] dark:bg-[#14261B] border border-[#BCEEE7] dark:border-[#234A31] px-2.5 py-0.5 rounded-md">
          {emp.designation || "STAFF"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (emp) => <StatusBadge status={emp.status} size="xs" />,
    },
    {
      key: "actions",
      header: "",
      className: "text-right w-20",
      render: (emp) => (
        <div className="flex items-center justify-end gap-1.5">
          <Link
            to={`/employees/${emp.id}`}
            className="p-1.5 rounded-lg text-[#74827A] hover:text-[#1A1D18] dark:hover:text-white hover:bg-[#F4F6F4] dark:hover:bg-[#151C18] border border-transparent hover:border-[#E5E9E7] dark:hover:border-[#1E2B23] transition-colors"
            title="View Details"
          >
            <Eye size={14} />
          </Link>
          {isAdmin && (
            <Link
              to={`/employees/${emp.id}/edit`}
              className="p-1.5 rounded-lg text-[#74827A] hover:text-[#2E8540] dark:hover:text-[#A3FF5F] hover:bg-[#F4F6F4] dark:hover:bg-[#151C18] border border-transparent hover:border-[#E5E9E7] dark:hover:border-[#1E2B23] transition-colors"
              title="Edit Profile"
            >
              <Edit size={14} />
            </Link>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Corporate Employees & Custodians"
        description="Active organization personnel, role designations, and assigned equipment custody."
        actions={
          isAdmin && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate("/employees/new")}
              icon={<Plus size={14} />}
            >
              Enroll Employee
            </Button>
          )
        }
      />

      <FilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search employees by name, email, code, dept..."
        hasActiveFilters={statusFilter !== "ALL" || deptFilter !== "ALL"}
        onClearFilters={() => {
          setStatusFilter("ALL");
          setDeptFilter("ALL");
        }}
        filters={
          <>
            <div className="w-32">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-8 text-xs py-1"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </Select>
            </div>

            <div className="w-40">
              <Select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="h-8 text-xs py-1"
              >
                <option value="ALL">All Departments</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </Select>
            </div>
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
          data={filtered}
          columns={columns}
          loading={loading}
          keyExtractor={(e) => e.id}
          pageSize={10}
          emptyMessage="No employees found matching filter criteria."
        />
      )}
    </div>
  );
}