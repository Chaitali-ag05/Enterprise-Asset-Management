import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, Play, Eye, Wrench, AlertTriangle } from "lucide-react";
import { maintenanceService } from "../../api/maintenanceService";
import type { MaintenanceWorkOrderResponse } from "../../types/maintenance";
import { useNotifications } from "../../context/NotificationContext";
import { useToast } from "../../context/ToastContext";
import { PageHeader } from "../../components/ui/PageHeader";
import { DataTable, type Column } from "../../components/ui/DataTable";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { Button } from "../../components/ui/Button";
import { formatDate } from "../../utils/formatDate";

export default function TechnicianWorkOrderPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { employeeId, loading: empLoading } = useNotifications();
  const [workOrders, setWorkOrders] = useState<MaintenanceWorkOrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    if (!empLoading) {
      fetchWorkOrders();
    }
  }, [employeeId, empLoading]);

  const fetchWorkOrders = async () => {
    try {
      setLoading(true);
      if (!employeeId) return;
      const data = await maintenanceService.getWorkOrdersByTechnician(employeeId);
      setWorkOrders(data.sort((a, b) => b.id - a.id));
    } catch (err) {
      console.error("Failed to load work orders", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (woId: number) => {
    try {
      setActionLoading(woId);
      await maintenanceService.respondToWorkOrder(woId, { action: "ACCEPT" });
      addToast("success", "Work order accepted.");
      fetchWorkOrders();
    } catch (err) {
      addToast("error", "Failed to accept order.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleStart = async (woId: number) => {
    try {
      setActionLoading(woId);
      await maintenanceService.startWorkOrder(woId);
      addToast("success", "Work started.");
      fetchWorkOrders();
    } catch (err) {
      addToast("error", "Failed to start repair.");
    } finally {
      setActionLoading(null);
    }
  };

  const columns: Column<MaintenanceWorkOrderResponse>[] = [
    {
      key: "workOrderCode",
      header: "WO Code",
      sortable: true,
      render: (wo) => (
        <span className="font-mono text-xs font-semibold text-[#2E8540] dark:text-[#A3FF5F]">
          {wo.workOrderCode || `WO-${wo.id}`}
        </span>
      ),
    },
    {
      key: "instructions",
      header: "Job Instructions & Scope",
      render: (wo) => (
        <div className="min-w-[200px]">
          <span className="font-medium text-xs text-[#1A1D18] dark:text-white block truncate">
            {wo.instructions || "General hardware inspection and repair"}
          </span>
          <span className="text-[11px] font-mono text-[#526159] dark:text-[#8E9C94]">
            Ticket: {wo.issueCode || `INC-${wo.issueId}`}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (wo) => <StatusBadge status={wo.status} size="xs" />,
    },
    {
      key: "assignedAt",
      header: "Assigned Date",
      sortable: true,
      render: (wo) => (
        <span className="font-mono text-xs text-[#526159] dark:text-[#8E9C94]">
          {formatDate(wo.assignedAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right w-44",
      render: (wo) => (
        <div className="flex items-center justify-end gap-1.5">
          {wo.status === "PENDING_ACCEPTANCE" && (
            <Button
              variant="primary"
              size="xs"
              onClick={() => handleAccept(wo.id)}
              loading={actionLoading === wo.id}
              icon={<Check size={11} />}
            >
              Accept
            </Button>
          )}

          {wo.status === "ACCEPTED" && (
            <Button
              variant="primary"
              size="xs"
              onClick={() => handleStart(wo.id)}
              loading={actionLoading === wo.id}
              icon={<Play size={11} />}
            >
              Start
            </Button>
          )}

          <Link to={`/maintenance/${wo.issueId}`}>
            <Button variant="outline" size="xs">
              Open Workbench
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Technician Maintenance Workbench"
        description="Assigned work orders, diagnostic actions, and execution workbench."
      />

      <DataTable
        data={workOrders}
        columns={columns}
        loading={loading}
        keyExtractor={(wo) => wo.id}
        pageSize={10}
        emptyMessage="No assigned maintenance jobs in your queue."
      />
    </div>
  );
}