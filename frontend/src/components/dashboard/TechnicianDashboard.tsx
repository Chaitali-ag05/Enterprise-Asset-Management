import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Wrench, 
  AlertTriangle, 
  Layers, 
  Check, 
  Play, 
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { maintenanceService } from "../../api/maintenanceService";
import type { MaintenanceWorkOrderResponse } from "../../types/maintenance";
import { useNotifications } from "../../context/NotificationContext";
import { useToast } from "../../context/ToastContext";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import { formatDate } from "../../utils/formatDate";

export default function TechnicianDashboard() {
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
      if (!employeeId) {
        setLoading(false);
        return;
      }
      const data = await maintenanceService.getWorkOrdersByTechnician(employeeId);
      setWorkOrders(data.sort((a, b) => b.id - a.id));
    } catch (err) {
      console.error("Failed to load technician orders", err);
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
      addToast("error", "Failed to accept work order.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleStart = async (woId: number) => {
    try {
      setActionLoading(woId);
      await maintenanceService.startWorkOrder(woId);
      addToast("success", "Repair diagnostics marked in-progress.");
      fetchWorkOrders();
    } catch (err) {
      addToast("error", "Failed to start repair job.");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>
    );
  }

  const pendingAcceptance = workOrders.filter((w) => w.status === "PENDING_ACCEPTANCE");
  const inProgress = workOrders.filter((w) => w.status === "IN_PROGRESS" || w.status === "ACCEPTED");
  const completed = workOrders.filter((w) => w.status === "COMPLETED");

  return (
    <div className="space-y-6">
      {/* Header matching reference */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E9E7] dark:border-[#18221D] pb-5 transition-colors duration-150">
        <div>
          <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#74827A] dark:text-[#6C7B73] block">
            TECHNICIAN WORKBENCH
          </span>
          <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-[#1A1D18] dark:text-[#F3F7F4] tracking-tight mt-1">
            Hardware & <span className="text-[#2E8540] dark:text-[#A3FF5F]">Field Repairs</span>
          </h1>
          <p className="text-sm text-[#526159] dark:text-[#8E9C94] mt-0.5">
            Accept dispatches, execute diagnostic procedures, and complete hardware repairs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/maintenance"
            className="px-4 py-2 rounded-xl bg-white dark:bg-[#0D1511] border border-[#E5E9E7] dark:border-[#1E2B23] hover:border-[#2E8540] dark:hover:border-[#A3FF5F] text-[#1A1D18] dark:text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-xs"
          >
            All Incident Tickets →
          </Link>
        </div>
      </div>

      {/* KPI Stats matching reference */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Pending Acceptance */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#0D1511] border border-[#E5E9E7] dark:border-[#1E2B23] relative overflow-hidden flex items-start justify-between shadow-sm dark:shadow-card hover:border-[#CBD5E1] dark:hover:border-[#27382F] transition-colors">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#D97706] dark:bg-[#FBBF24] rounded-r-sm" />
          <div className="pl-1.5 space-y-0.5">
            <p className="text-xs text-[#526159] dark:text-[#8E9C94]">Pending Acceptance</p>
            <p className="font-heading text-2xl font-bold text-[#1A1D18] dark:text-white mt-1">
              {pendingAcceptance.length < 10 ? `0${pendingAcceptance.length}` : pendingAcceptance.length}
            </p>
            <p className="text-[11px] font-mono text-[#D97706] dark:text-[#FBBF24]">Requires confirmation</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#FEF6E7] dark:bg-[#262010] border border-[#FDE6B8] dark:border-[#483B19] flex items-center justify-center text-[#D97706] dark:text-[#FBBF24] shrink-0">
            <AlertTriangle size={17} />
          </div>
        </div>

        {/* Card 2: In-Progress Repairs */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#0D1511] border border-[#E5E9E7] dark:border-[#1E2B23] relative overflow-hidden flex items-start justify-between shadow-sm dark:shadow-card hover:border-[#CBD5E1] dark:hover:border-[#27382F] transition-colors">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#0D9488] dark:bg-[#55D6BE] rounded-r-sm" />
          <div className="pl-1.5 space-y-0.5">
            <p className="text-xs text-[#526159] dark:text-[#8E9C94]">In-Progress</p>
            <p className="font-heading text-2xl font-bold text-[#1A1D18] dark:text-white mt-1">
              {inProgress.length < 10 ? `0${inProgress.length}` : inProgress.length}
            </p>
            <p className="text-[11px] font-mono text-[#0D9488] dark:text-[#55D6BE]">Under active repair</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#E6F9F6] dark:bg-[#14261B] border border-[#BCEEE7] dark:border-[#234A31] flex items-center justify-center text-[#0D9488] dark:text-[#55D6BE] shrink-0">
            <Wrench size={17} />
          </div>
        </div>

        {/* Card 3: Completed Repairs */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#0D1511] border border-[#E5E9E7] dark:border-[#1E2B23] relative overflow-hidden flex items-start justify-between shadow-sm dark:shadow-card hover:border-[#CBD5E1] dark:hover:border-[#27382F] transition-colors">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#2E8540] dark:bg-[#A3FF5F] rounded-r-sm" />
          <div className="pl-1.5 space-y-0.5">
            <p className="text-xs text-[#526159] dark:text-[#8E9C94]">Completed</p>
            <p className="font-heading text-2xl font-bold text-[#1A1D18] dark:text-white mt-1">
              {completed.length < 10 ? `0${completed.length}` : completed.length}
            </p>
            <p className="text-[11px] font-mono text-[#2E8540] dark:text-[#A3FF5F]">Sign-off pending</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#EAF7EE] dark:bg-[#14261B] border border-[#C2E8CE] dark:border-[#234A31] flex items-center justify-center text-[#2E8540] dark:text-[#A3FF5F] shrink-0">
            <CheckCircle2 size={17} />
          </div>
        </div>

        {/* Card 4: Total Assigned */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#0D1511] border border-[#E5E9E7] dark:border-[#1E2B23] relative overflow-hidden flex items-start justify-between shadow-sm dark:shadow-card hover:border-[#CBD5E1] dark:hover:border-[#27382F] transition-colors">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#7C3AED] dark:bg-[#A78BFA] rounded-r-sm" />
          <div className="pl-1.5 space-y-0.5">
            <p className="text-xs text-[#526159] dark:text-[#8E9C94]">Total Work Orders</p>
            <p className="font-heading text-2xl font-bold text-[#1A1D18] dark:text-white mt-1">
              {workOrders.length < 10 ? `0${workOrders.length}` : workOrders.length}
            </p>
            <p className="text-[11px] font-mono text-[#7C3AED] dark:text-[#A78BFA]">Lifetime tickets</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#F5F3FF] dark:bg-[#20152B] border border-[#DDD6FE] dark:border-[#3D2652] flex items-center justify-center text-[#7C3AED] dark:text-[#A78BFA] shrink-0">
            <Layers size={17} />
          </div>
        </div>
      </div>

      {/* Main Workbench Orders Section */}
      <div className="space-y-4">
        <h3 className="font-heading font-semibold text-base text-[#1A1D18] dark:text-white flex items-center gap-2">
          <Wrench size={16} className="text-[#2E8540] dark:text-[#A3FF5F]" />
          Active Work Orders & Repair Queue
        </h3>

        {workOrders.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-[#0D1511] border border-[#E5E9E7] dark:border-[#1E2B23] rounded-xl text-[#74827A] dark:text-[#6C7B73] space-y-2 shadow-sm dark:shadow-card">
            <Wrench size={32} className="mx-auto text-[#74827A]/50 dark:text-[#25312B]" />
            <p className="text-sm font-medium text-[#526159] dark:text-[#8E9C94]">No assigned work orders</p>
            <p className="text-xs text-[#74827A] dark:text-[#6C7B73]">You are all caught up! New repair orders will appear here when dispatched.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workOrders.map((wo) => {
              const isPending = wo.status === "PENDING_ACCEPTANCE";
              const isInProg = wo.status === "IN_PROGRESS" || wo.status === "ACCEPTED";
              const isComp = wo.status === "COMPLETED";

              return (
                <div
                  key={wo.id}
                  className="p-4 rounded-xl bg-white dark:bg-[#0D1511] border border-[#E5E9E7] dark:border-[#1E2B23] flex flex-col justify-between space-y-4 hover:border-[#CBD5E1] dark:hover:border-[#27382F] transition-all shadow-sm dark:shadow-card relative overflow-hidden"
                >
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1 ${
                      isPending
                        ? "bg-[#D97706] dark:bg-[#FBBF24]"
                        : isInProg
                        ? "bg-[#0D9488] dark:bg-[#55D6BE]"
                        : isComp
                        ? "bg-[#2E8540] dark:bg-[#A3FF5F]"
                        : "bg-[#74827A] dark:bg-[#6C7B73]"
                    }`}
                  />

                  <div className="pl-1.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold text-[#2E8540] dark:text-[#A3FF5F]">
                        {wo.workOrderCode || `WO-${wo.id}`}
                      </span>
                      <StatusBadge status={wo.status} size="xs" />
                    </div>

                    <div>
                      <h4 className="font-heading font-semibold text-sm text-[#1A1D18] dark:text-[#F3F7F4] line-clamp-1">
                        {wo.instructions || `Work Order #${wo.workOrderCode || wo.id}`}
                      </h4>
                      <p className="text-xs text-[#526159] dark:text-[#8E9C94] line-clamp-2 mt-0.5">
                        {wo.actionTaken || wo.diagnosis || "Awaiting technician diagnostic procedures."}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#E5E9E7] dark:border-[#18221D] flex items-center justify-between text-[11px] font-mono text-[#74827A] dark:text-[#6C7B73]">
                      <span>Dispatched:</span>
                      <span className="text-[#1A1D18] dark:text-white font-medium">{formatDate(wo.assignedAt || (wo as any).createdAt)}</span>
                    </div>
                  </div>

                  <div className="pl-1.5 pt-1 flex items-center gap-2">
                    {isPending ? (
                      <button
                        type="button"
                        onClick={() => handleAccept(wo.id)}
                        disabled={actionLoading === wo.id}
                        className="w-full py-2 rounded-lg bg-[#2E8540] hover:bg-[#236C33] text-white dark:bg-[#A3FF5F] dark:hover:bg-[#8EF04C] dark:text-[#080D0B] font-semibold text-xs shadow-sm dark:shadow-lime-glow flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                      >
                        <Check size={14} />
                        {actionLoading === wo.id ? "Accepting..." : "Accept Work Order"}
                      </button>
                    ) : isInProg ? (
                      <Link
                        to={`/maintenance/${wo.issueId || wo.id}`}
                        className="w-full py-2 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white dark:bg-[#55D6BE] dark:hover:bg-[#44B29E] dark:text-[#080D0B] font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                      >
                        <Play size={14} />
                        Execute Diagnostics & Complete
                      </Link>
                    ) : (
                      <Link
                        to={`/maintenance/${wo.issueId || wo.id}`}
                        className="w-full py-2 rounded-lg bg-[#F4F6F4] dark:bg-[#151C18] border border-[#E5E9E7] dark:border-[#1E2B23] hover:bg-[#EBF1ED] dark:hover:bg-[#19221D] text-[#1A1D18] dark:text-[#F3F7F4] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        View Resolution Details
                        <ArrowRight size={13} />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}