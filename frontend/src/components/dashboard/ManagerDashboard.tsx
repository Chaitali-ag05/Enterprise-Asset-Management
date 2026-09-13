import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Wrench, 
  UserCheck, 
  CheckCircle2, 
  Layers,
  Check
} from "lucide-react";
import { maintenanceService } from "../../api/maintenanceService";
import { assetApi } from "../../api/assetApi";
import { assignmentService } from "../../api/assignmentService";
import type { MaintenanceIssueResponse } from "../../types/maintenance";
import type { AssetResponse } from "../../types/asset";
import { StatusBadge } from "../ui/StatusBadge";
import { Skeleton } from "../ui/Skeleton";
import { useToast } from "../../context/ToastContext";
import { formatDate } from "../../utils/formatDate";

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [issues, setIssues] = useState<MaintenanceIssueResponse[]>([]);
  const [assets, setAssets] = useState<AssetResponse[]>([]);
  const [allocationsCount, setAllocationsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [issueList, assetList, asgnList] = await Promise.all([
        maintenanceService.getIssues().catch(() => []),
        assetApi.getAll().catch(() => []),
        assignmentService.getAll().catch(() => []),
      ]);

      const iList = Array.isArray(issueList) ? issueList : (issueList as any).content || [];
      const aList = Array.isArray(assetList) ? assetList : (assetList as any).content || [];
      const asList = Array.isArray(asgnList) ? asgnList : (asgnList as any).content || [];

      setIssues(iList);
      setAssets(aList);
      setAllocationsCount(asList.filter((a: any) => a.status === "ACTIVE").length);
    } catch (err) {
      console.error("Failed to load manager operations data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickApprove = async (woId: number) => {
    try {
      setActionLoading(woId);
      await maintenanceService.applyWorkOrderDecision(woId, {
        decision: "APPROVE_REPAIR",
        notes: "Approved via Manager Operations Dashboard",
      });
      addToast("success", "Work order repair approved and incident closed.");
      fetchData();
    } catch (err) {
      addToast("error", "Failed to approve repair.");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      </div>
    );
  }

  const dispatchQueue = issues.filter(i => i.status === "REPORTED" || i.status === "UNDER_REVIEW");
  const completedAwaitingApproval = issues.filter(i => {
    if (i.status !== "COMPLETED") return false;
    const latestWO = i.workOrders && i.workOrders.length > 0 ? i.workOrders[i.workOrders.length - 1] : null;
    return latestWO && latestWO.status === "COMPLETED";
  });

  const availableToDeploy = assets.filter(a => a.status === "AVAILABLE").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E9E7] dark:border-[#18221D] pb-5 transition-colors duration-150">
        <div>
          <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#74827A] dark:text-[#6C7B73] block">
            OPERATIONS CONTROL PORTAL
          </span>
          <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-[#1A1D18] dark:text-[#F3F7F4] tracking-tight mt-1">
            Operations <span className="text-[#2E8540] dark:text-[#A3FF5F]">Dispatch</span>
          </h1>
          <p className="text-sm text-[#526159] dark:text-[#8E9C94] mt-0.5">
            Monitor deployments, dispatch field technicians, and authorize completed repairs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/assignments/new"
            className="px-4 py-2 rounded-xl bg-[#2E8540] hover:bg-[#236C33] text-white dark:bg-[#A3FF5F] dark:hover:bg-[#8EF04C] dark:text-[#080D0B] font-semibold text-xs tracking-wide shadow-sm dark:shadow-lime-glow flex items-center gap-2 transition-all"
          >
            + Deploy Hardware
          </Link>
        </div>
      </div>

      {/* Operational Metric Blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Ready for Deployment */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#0D1511] border border-[#E5E9E7] dark:border-[#1E2B23] relative overflow-hidden flex items-start justify-between shadow-sm dark:shadow-card hover:border-[#CBD5E1] dark:hover:border-[#27382F] transition-colors">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#2E8540] dark:bg-[#A3FF5F] rounded-r-sm" />
          <div className="pl-1.5 space-y-0.5">
            <p className="text-xs text-[#526159] dark:text-[#8E9C94]">Ready for Deployment</p>
            <p className="font-heading text-2xl font-bold text-[#1A1D18] dark:text-white mt-1">{availableToDeploy}</p>
            <p className="text-[11px] font-mono text-[#2E8540] dark:text-[#A3FF5F]">Available in storage</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#EAF7EE] dark:bg-[#14261B] border border-[#C2E8CE] dark:border-[#234A31] flex items-center justify-center text-[#2E8540] dark:text-[#A3FF5F] shrink-0">
            <Layers size={17} />
          </div>
        </div>

        {/* Card 2: Active Allocations */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#0D1511] border border-[#E5E9E7] dark:border-[#1E2B23] relative overflow-hidden flex items-start justify-between shadow-sm dark:shadow-card hover:border-[#CBD5E1] dark:hover:border-[#27382F] transition-colors">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#0D9488] dark:bg-[#55D6BE] rounded-r-sm" />
          <div className="pl-1.5 space-y-0.5">
            <p className="text-xs text-[#526159] dark:text-[#8E9C94]">Active Allocations</p>
            <p className="font-heading text-2xl font-bold text-[#1A1D18] dark:text-white mt-1">{allocationsCount}</p>
            <p className="text-[11px] font-mono text-[#0D9488] dark:text-[#55D6BE]">Active employee custody</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#E6F9F6] dark:bg-[#14261B] border border-[#BCEEE7] dark:border-[#234A31] flex items-center justify-center text-[#0D9488] dark:text-[#55D6BE] shrink-0">
            <UserCheck size={17} />
          </div>
        </div>

        {/* Card 3: Pending Tech Dispatch */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#0D1511] border border-[#E5E9E7] dark:border-[#1E2B23] relative overflow-hidden flex items-start justify-between shadow-sm dark:shadow-card hover:border-[#CBD5E1] dark:hover:border-[#27382F] transition-colors">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#D97706] dark:bg-[#FBBF24] rounded-r-sm" />
          <div className="pl-1.5 space-y-0.5">
            <p className="text-xs text-[#526159] dark:text-[#8E9C94]">Pending Tech Dispatch</p>
            <p className="font-heading text-2xl font-bold text-[#1A1D18] dark:text-white mt-1">{dispatchQueue.length}</p>
            <p className="text-[11px] font-mono text-[#D97706] dark:text-[#FBBF24]">Requires technician</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#FEF6E7] dark:bg-[#262010] border border-[#FDE6B8] dark:border-[#483B19] flex items-center justify-center text-[#D97706] dark:text-[#FBBF24] shrink-0">
            <Wrench size={17} />
          </div>
        </div>

        {/* Card 4: Repairs Awaiting Decision */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#0D1511] border border-[#E5E9E7] dark:border-[#1E2B23] relative overflow-hidden flex items-start justify-between shadow-sm dark:shadow-card hover:border-[#CBD5E1] dark:hover:border-[#27382F] transition-colors">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#7C3AED] dark:bg-[#A78BFA] rounded-r-sm" />
          <div className="pl-1.5 space-y-0.5">
            <p className="text-xs text-[#526159] dark:text-[#8E9C94]">Repairs Awaiting Decision</p>
            <p className="font-heading text-2xl font-bold text-[#1A1D18] dark:text-white mt-1">{completedAwaitingApproval.length}</p>
            <p className="text-[11px] font-mono text-[#7C3AED] dark:text-[#A78BFA]">Ready for QA sign-off</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#F5F3FF] dark:bg-[#20152B] border border-[#DDD6FE] dark:border-[#3D2652] flex items-center justify-center text-[#7C3AED] dark:text-[#A78BFA] shrink-0">
            <CheckCircle2 size={17} />
          </div>
        </div>
      </div>

      {/* Main Operational Queues Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Queue 1: Technician Dispatch Queue */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#0D1511] border border-[#E5E9E7] dark:border-[#1E2B23] shadow-sm dark:shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E9E7] dark:border-[#18221D] pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#FEF6E7] dark:bg-[#262010] border border-[#FDE6B8] dark:border-[#483B19] flex items-center justify-center text-[#D97706] dark:text-[#FBBF24]">
                <Wrench size={15} />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-sm text-[#1A1D18] dark:text-[#F3F7F4]">Technician Dispatch Queue</h3>
                <p className="text-[11px] text-[#526159] dark:text-[#8E9C94]">Reported issues awaiting field diagnostic assignment</p>
              </div>
            </div>
            <span className="font-mono text-xs font-bold text-[#D97706] dark:text-[#FBBF24] px-2.5 py-0.5 rounded-md bg-[#FEF6E7] dark:bg-[#262010] border border-[#FDE6B8] dark:border-[#483B19]">
              {dispatchQueue.length} tickets
            </span>
          </div>

          <div className="space-y-2.5">
            {dispatchQueue.length === 0 ? (
              <p className="py-8 text-center text-xs text-[#74827A] dark:text-[#6C7B73]">
                No pending maintenance tickets requiring technician dispatch.
              </p>
            ) : (
              dispatchQueue.slice(0, 4).map((iss) => (
                <div key={iss.id} className="p-3.5 rounded-xl bg-[#F8FAF9] dark:bg-[#080D0B] border border-[#E5E9E7] dark:border-[#18221D] flex items-center justify-between gap-3 hover:border-[#2E8540]/30 dark:hover:border-[#27382F] transition-colors">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-xs text-[#2E8540] dark:text-[#A3FF5F]">
                        {iss.issueCode || `INC-${iss.id}`}
                      </span>
                      <StatusBadge status={iss.priority} size="xs" />
                    </div>
                    <p className="text-xs font-semibold text-[#1A1D18] dark:text-[#F3F7F4] truncate mt-1">
                      {iss.title || iss.description}
                    </p>
                    <p className="text-[11px] font-mono text-[#74827A] dark:text-[#6C7B73] mt-0.5">
                      Asset: {iss.assetCode || "AST-001"} · Reported by {iss.reportedByName || "Employee"}
                    </p>
                  </div>

                  <Link
                    to={`/maintenance/${iss.id}`}
                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#0D1511] border border-[#E5E9E7] dark:border-[#1E2B23] hover:border-[#2E8540] dark:hover:border-[#A3FF5F]/50 text-[#2E8540] dark:text-[#A3FF5F] text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors shadow-xs"
                  >
                    Dispatch →
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Queue 2: Completed Repairs Awaiting Decision */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#0D1511] border border-[#E5E9E7] dark:border-[#1E2B23] shadow-sm dark:shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E9E7] dark:border-[#18221D] pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#EAF7EE] dark:bg-[#14261B] border border-[#C2E8CE] dark:border-[#234A31] flex items-center justify-center text-[#2E8540] dark:text-[#A3FF5F]">
                <CheckCircle2 size={15} />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-sm text-[#1A1D18] dark:text-[#F3F7F4]">Completed Repairs Awaiting Decision</h3>
                <p className="text-[11px] text-[#526159] dark:text-[#8E9C94]">Completed repairs ready for QA sign-off and closure</p>
              </div>
            </div>
            <span className="font-mono text-xs font-bold text-[#2E8540] dark:text-[#A3FF5F] px-2.5 py-0.5 rounded-md bg-[#EAF7EE] dark:bg-[#14261B] border border-[#C2E8CE] dark:border-[#234A31]">
              {completedAwaitingApproval.length} ready
            </span>
          </div>

          <div className="space-y-2.5">
            {completedAwaitingApproval.length === 0 ? (
              <p className="py-8 text-center text-xs text-[#74827A] dark:text-[#6C7B73]">
                No completed repairs currently awaiting manager sign-off.
              </p>
            ) : (
              completedAwaitingApproval.slice(0, 4).map((iss) => {
                const latestWO = iss.workOrders && iss.workOrders.length > 0 ? iss.workOrders[iss.workOrders.length - 1] : null;
                return (
                  <div key={iss.id} className="p-3.5 rounded-xl bg-[#F8FAF9] dark:bg-[#080D0B] border border-[#E5E9E7] dark:border-[#18221D] flex items-center justify-between gap-3 hover:border-[#2E8540]/30 dark:hover:border-[#27382F] transition-colors">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-xs text-[#2E8540] dark:text-[#A3FF5F]">
                          {iss.issueCode || `INC-${iss.id}`}
                        </span>
                        <span className="text-[10px] font-mono text-[#0D9488] dark:text-[#55D6BE] bg-[#E6F9F6] dark:bg-[#14261B] border border-[#BCEEE7] dark:border-[#234A31] px-2 py-0.5 rounded">
                          Cost: ${latestWO?.repairCost?.toFixed(2) || "0.00"}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-[#1A1D18] dark:text-[#F3F7F4] truncate mt-1">
                        {latestWO?.actionTaken || iss.title}
                      </p>
                      <p className="text-[11px] font-mono text-[#74827A] dark:text-[#6C7B73] mt-0.5">
                        Tech: {latestWO?.technicianName || "Lead Tech"} · {formatDate(iss.reportedAt)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        to={`/maintenance/${iss.id}`}
                        className="px-3 py-1.5 rounded-lg border border-[#E5E9E7] dark:border-[#1E2B23] bg-white dark:bg-transparent hover:bg-[#F4F6F4] dark:hover:bg-[#111A15] text-[#526159] dark:text-[#8E9C94] text-xs transition-colors"
                      >
                        Inspect
                      </Link>
                      {latestWO && (
                        <button
                          type="button"
                          onClick={() => handleQuickApprove(latestWO.id)}
                          disabled={actionLoading === latestWO.id}
                          className="px-3 py-1.5 rounded-lg bg-[#2E8540] hover:bg-[#236C33] text-white dark:bg-[#A3FF5F] dark:hover:bg-[#8EF04C] dark:text-[#080D0B] font-semibold text-xs shadow-sm dark:shadow-lime-glow flex items-center gap-1 transition-all disabled:opacity-50"
                        >
                          <Check size={13} />
                          {actionLoading === latestWO.id ? "Approving..." : "Approve"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}