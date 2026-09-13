import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Eye, AlertTriangle } from "lucide-react";
import { assignmentService } from "../../api/assignmentService";
import type { AssignmentResponse } from "../../types/assignment";
import { useAuthStore } from "../../context/useAuthStore";
import { useNotifications } from "../../context/NotificationContext";
import { PageHeader } from "../../components/ui/PageHeader";
import { DataTable, type Column } from "../../components/ui/DataTable";
import { FilterBar } from "../../components/ui/FilterBar";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { Button } from "../../components/ui/Button";
import { formatDate } from "../../utils/formatDate";

export default function AssignmentListPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { employeeId, loading: empLoading } = useNotifications();
  const [assignments, setAssignments] = useState<AssignmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const canCreate = ["ROLE_ADMIN", "ROLE_MANAGER"].includes(user?.role || "");

  useEffect(() => {
    if (!empLoading) {
      fetchAssignments();
    }
  }, [user, employeeId, empLoading]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError("");
      const isEmployeeOrTech = ["ROLE_EMPLOYEE", "ROLE_TECHNICIAN"].includes(user?.role || "");
      
      let data: AssignmentResponse[] = [];
      if (isEmployeeOrTech) {
        if (!employeeId) throw new Error("Employee identity not found");
        data = await assignmentService.getByEmployeeId(employeeId);
      } else {
        data = await assignmentService.getAll();
      }
          
      setAssignments(data.sort((a, b) => b.id - a.id));
    } catch (err: unknown) {
      setError("Failed to load assignment records.");
    } finally {
      setLoading(false);
    }
  };

  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      const s = search.toLowerCase();
      return (
        search === "" ||
        (a.employeeName && a.employeeName.toLowerCase().includes(s)) ||
        (a.currentDepartmentName && a.currentDepartmentName.toLowerCase().includes(s)) ||
        String(a.id).includes(s) ||
        (a.items && a.items.some((item) => item.assetName.toLowerCase().includes(s)))
      );
    });
  }, [assignments, search]);

  const columns: Column<AssignmentResponse>[] = [
    {
      key: "id",
      header: "ASSIGNMENT ID",
      sortable: true,
      render: (a) => (
        <span className="font-mono text-sm font-semibold text-[#2E8540] dark:text-[#A3FF5F]">
          ASN-{a.id.toString().padStart(4, "0")}
        </span>
      ),
    },
    {
      key: "employeeName",
      header: "ASSIGNED CUSTODIAN",
      sortable: true,
      render: (a) => (
        <div>
          <span className="font-medium text-sm text-[#1A1D18] dark:text-[#F3F7F4] block">
            {a.employeeName}
          </span>
          <span className="text-xs font-mono text-[#526159] dark:text-[#87948C]">
            {a.currentDepartmentName || "General Dept"}
          </span>
        </div>
      ),
    },
    {
      key: "items",
      header: "HARDWARE ALLOCATED",
      render: (a) => (
        <div className="space-y-1 max-w-xs truncate">
          {a.items && a.items.length > 0 ? (
            a.items.map((item, i) => (
              <span key={i} className="text-sm text-[#1A1D18] dark:text-[#C0CCC5] block truncate">
                • {item.assetName} <span className="font-mono text-xs text-[#526159] dark:text-[#87948C]">({item.assetCode})</span>
              </span>
            ))
          ) : (
            <span className="text-xs text-[#74827A] dark:text-[#87948C] italic">No items attached</span>
          )}
        </div>
      ),
    },
    {
      key: "assignedAt",
      header: "ASSIGNED DATE",
      sortable: true,
      render: (a) => (
        <span className="font-mono text-xs text-[#526159] dark:text-[#87948C]">
          {formatDate(a.assignedAt)}
        </span>
      ),
    },
    {
      key: "status",
      header: "STATUS",
      sortable: true,
      render: (a) => <StatusBadge status={a.status} size="sm" />,
    },
    {
      key: "actions",
      header: "",
      className: "text-right w-16",
      render: (a) => (
        <Link
          to={`/assignments/${a.id}`}
          className="p-1.5 rounded-lg text-[#74827A] hover:text-[#1A1D18] dark:hover:text-[#F3F7F4] hover:bg-[#F4F6F4] dark:hover:bg-[#151C18] transition-colors inline-flex"
          title="View Assignment Details"
        >
          <Eye size={16} />
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Hardware Asset Allocations"
        description="Track checkouts, employee device custody, and assignment status history."
        actions={
          canCreate && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate("/assignments/new")}
              icon={<Plus size={14} />}
            >
              New Allocation
            </Button>
          )
        }
      />

      <FilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by employee, department, asset..."
      />

      {error ? (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400 text-xs">
          <AlertTriangle size={16} />
          <p>{error}</p>
        </div>
      ) : (
        <DataTable
          data={filteredAssignments}
          columns={columns}
          loading={loading}
          keyExtractor={(a) => a.id}
          pageSize={10}
          emptyMessage="No hardware assignment records found."
          emptyAction={
            canCreate ? (
              <Button variant="primary" size="sm" onClick={() => navigate("/assignments/new")} icon={<Plus size={14} />}>
                Create First Assignment
              </Button>
            ) : null
          }
        />
      )}
    </div>
  );
}