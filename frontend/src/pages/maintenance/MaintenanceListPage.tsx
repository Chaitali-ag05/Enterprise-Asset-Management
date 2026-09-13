import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Eye, Kanban, Table as TableIcon, AlertTriangle } from "lucide-react";
import { maintenanceService } from "../../api/maintenanceService";
import type { MaintenanceIssueResponse } from "../../types/maintenance";
import { useAuthStore } from "../../context/useAuthStore";
import { useNotifications } from "../../context/NotificationContext";
import { PageHeader } from "../../components/ui/PageHeader";
import { DataTable, type Column } from "../../components/ui/DataTable";
import { FilterBar } from "../../components/ui/FilterBar";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";
import { formatDate } from "../../utils/formatDate";
import { cn } from "../../utils/cn";

export default function MaintenanceListPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { employeeId, loading: empLoading } = useNotifications();
  const [issues, setIssues] = useState<MaintenanceIssueResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");

  useEffect(() => {
    if (!empLoading) {
      fetchIssues();
    }
  }, [user, employeeId, empLoading]);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      setError("");
      const isEmployee = user?.role === "ROLE_EMPLOYEE";
      
      let data: MaintenanceIssueResponse[] = [];
      if (isEmployee) {
        if (!employeeId) throw new Error("Employee identity not found");
        data = await maintenanceService.getIssuesByReporter(employeeId);
      } else {
        data = await maintenanceService.getIssues();
      }

      setIssues(data.sort((a, b) => b.id - a.id));
    } catch (err) {
      setError("Failed to load maintenance incident records.");
    } finally {
      setLoading(false);
    }
  };

  const filteredIssues = useMemo(() => {
    return issues.filter((iss) => {
      const s = search.toLowerCase();
      const matchSearch =
        search === "" ||
        (iss.title && iss.title.toLowerCase().includes(s)) ||
        (iss.issueCode && iss.issueCode.toLowerCase().includes(s)) ||
        (iss.assetCode && iss.assetCode.toLowerCase().includes(s)) ||
        (iss.reportedByName && iss.reportedByName.toLowerCase().includes(s));

      const matchStatus = statusFilter === "ALL" || iss.status === statusFilter;
      const matchPriority = priorityFilter === "ALL" || iss.priority === priorityFilter;

      return matchSearch && matchStatus && matchPriority;
    });
  }, [issues, search, statusFilter, priorityFilter]);

  const columns: Column<MaintenanceIssueResponse>[] = [
    {
      key: "issueCode",
      header: "TICKET ID",
      sortable: true,
      render: (iss) => (
        <span className="font-mono text-sm font-semibold text-[#2E8540] dark:text-[#A3FF5F]">
          {iss.issueCode || `INC-${iss.id.toString().padStart(4, "0")}`}
        </span>
      ),
    },
    {
      key: "title",
      header: "INCIDENT & ASSET",
      sortable: true,
      render: (iss) => (
        <div className="min-w-[200px]">
          <Link
            to={`/maintenance/${iss.id}`}
            className="font-semibold text-sm text-[#1A1D18] dark:text-[#F3F7F4] hover:text-[#2E8540] dark:hover:text-[#A3FF5F] transition-colors block truncate"
          >
            {iss.title || "Hardware Incident"}
          </Link>
          <span className="text-xs font-mono text-[#526159] dark:text-[#87948C] truncate block">
            Asset: {iss.assetCode || "—"} · Reported by {iss.reportedByName || "Staff"}
          </span>
        </div>
      ),
    },
    {
      key: "priority",
      header: "PRIORITY",
      sortable: true,
      render: (iss) => <StatusBadge status={iss.priority} size="sm" />,
    },
    {
      key: "status",
      header: "STATUS",
      sortable: true,
      render: (iss) => <StatusBadge status={iss.status} size="sm" />,
    },
    {
      key: "reportedAt",
      header: "LOGGED ON",
      sortable: true,
      render: (iss) => (
        <span className="font-mono text-xs text-[#526159] dark:text-[#87948C]">
          {formatDate(iss.reportedAt || (iss as any).createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right w-16",
      render: (iss) => (
        <Link
          to={`/maintenance/${iss.id}`}
          className="p-1.5 rounded-lg text-[#74827A] hover:text-[#1A1D18] dark:hover:text-[#F3F7F4] hover:bg-[#F4F6F4] dark:hover:bg-[#151C18] transition-colors inline-flex"
          title="View Ticket Details"
        >
          <Eye size={15} />
        </Link>
      ),
    },
  ];

  const kanbanColumns = [
    { title: "REPORTED", status: "REPORTED" },
    { title: "UNDER REVIEW", status: "UNDER_REVIEW" },
    { title: "ACCEPTED", status: "ACCEPTED" },
    { title: "IN PROGRESS", status: "IN_PROGRESS" },
    { title: "COMPLETED", status: "COMPLETED" },
    { title: "RESOLVED", status: "RESOLVED" },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Maintenance Queue"
        description="Incident diagnostics, technician work orders, and repair authorization workflows."
        actions={
          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex items-center p-0.5 border border-[#E5E9E7] dark:border-[#25312B] bg-[#F4F6F4] dark:bg-[#111714] rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={cn(
                  "p-1.5 rounded-lg text-xs transition-colors",
                  viewMode === "table" ? "bg-white dark:bg-[#151C18] text-[#2E8540] dark:text-[#A3FF5F] font-semibold shadow-xs" : "text-[#526159] dark:text-[#87948C]"
                )}
                title="Table View"
              >
                <TableIcon size={14} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("kanban")}
                className={cn(
                  "p-1.5 rounded-lg text-xs transition-colors",
                  viewMode === "kanban" ? "bg-white dark:bg-[#151C18] text-[#2E8540] dark:text-[#A3FF5F] font-semibold shadow-xs" : "text-[#526159] dark:text-[#87948C]"
                )}
                title="Kanban Board"
              >
                <Kanban size={14} />
              </button>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate("/maintenance/report")}
              icon={<Plus size={14} />}
            >
              Report Issue
            </Button>
          </div>
        }
      />

      <FilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search tickets, assets, employees..."
        hasActiveFilters={statusFilter !== "ALL" || priorityFilter !== "ALL"}
        onClearFilters={() => {
          setStatusFilter("ALL");
          setPriorityFilter("ALL");
        }}
        filters={
          <>
            <div className="w-36">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 text-xs"
              >
                <option value="ALL">All Statuses</option>
                <option value="REPORTED">Reported</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="RESOLVED">Resolved</option>
              </Select>
            </div>

            <div className="w-32">
              <Select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="h-9 text-xs"
              >
                <option value="ALL">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </Select>
            </div>
          </>
        }
      />

      {error ? (
        <div className="p-4 bg-red-50 dark:bg-red-500/15 border border-red-200 dark:border-red-500/40 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400 text-xs">
          <AlertTriangle size={16} />
          <p>{error}</p>
        </div>
      ) : viewMode === "table" ? (
        <DataTable
          data={filteredIssues}
          columns={columns}
          loading={loading}
          keyExtractor={(iss) => iss.id}
          pageSize={10}
          emptyMessage="No maintenance tickets found."
          emptyAction={
            <Button variant="primary" size="sm" onClick={() => navigate("/maintenance/report")} icon={<Plus size={14} />}>
              Report First Issue
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 overflow-x-auto pb-4">
          {kanbanColumns.map((col) => {
            const colIssues = filteredIssues.filter((i) => i.status === col.status);
            return (
              <div
                key={col.status}
                className="bg-white dark:bg-[#111714] border border-[#E5E9E7] dark:border-[#25312B] rounded-xl p-3 flex flex-col min-w-[210px] shadow-sm dark:shadow-card"
              >
                <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-[#E5E9E7] dark:border-[#25312B]">
                  <span className="font-heading font-semibold text-xs uppercase tracking-wider text-[#526159] dark:text-[#C0CCC5]">
                    {col.title}
                  </span>
                  <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-[#F4F6F4] dark:bg-[#151C18] text-[#526159] dark:text-[#87948C] border border-[#E5E9E7] dark:border-[#25312B]">
                    {colIssues.length}
                  </span>
                </div>

                <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[520px]">
                  {colIssues.map((issue) => (
                    <div
                      key={issue.id}
                      onClick={() => navigate(`/maintenance/${issue.id}`)}
                      className="p-3.5 bg-[#F8FAF9] dark:bg-[#151C18] border border-[#E5E9E7] dark:border-[#25312B] rounded-lg shadow-xs hover:border-[#2E8540]/50 dark:hover:border-[#A3FF5F]/50 cursor-pointer transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-semibold text-[#2E8540] dark:text-[#A3FF5F]">
                          {issue.issueCode || `INC-${issue.id}`}
                        </span>
                        <StatusBadge status={issue.priority} size="xs" showDot={false} />
                      </div>
                      <p className="font-semibold text-sm text-[#1A1D18] dark:text-[#F3F7F4] line-clamp-2">
                        {issue.title}
                      </p>
                      <p className="text-xs font-mono text-[#526159] dark:text-[#87948C] truncate">
                        {issue.assetCode || "Asset"} · {issue.reportedByName || "Staff"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}