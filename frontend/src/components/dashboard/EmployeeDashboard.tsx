import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Laptop, Wrench, Plus, CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";
import { assetApi } from "../../api/assetApi";
import { maintenanceService } from "../../api/maintenanceService";
import type { AssetResponse } from "../../types/asset";
import type { MaintenanceIssueResponse } from "../../types/maintenance";
import { useNotifications } from "../../context/NotificationContext";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import { formatDate } from "../../utils/formatDate";

export default function EmployeeDashboard() {
  const { employeeId, loading: empLoading } = useNotifications();
  const [assignedAssets, setAssignedAssets] = useState<AssetResponse[]>([]);
  const [myIssues, setMyIssues] = useState<MaintenanceIssueResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!empLoading) {
      fetchMyData();
    }
  }, [employeeId, empLoading]);

  const fetchMyData = async () => {
    try {
      setLoading(true);
      if (!employeeId) {
        setLoading(false);
        return;
      }

      const [assetsData, issuesData] = await Promise.all([
        assetApi.getByEmployeeId(employeeId),
        maintenanceService.getIssuesByReporter(employeeId),
      ]);

      const aList = Array.isArray(assetsData) ? assetsData : (assetsData as any).content || [];
      setAssignedAssets(aList);
      setMyIssues(issuesData);
    } catch (err) {
      console.error("Employee dashboard data load error", err);
    } finally {
      setLoading(false);
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

  const activeIssues = myIssues.filter((i) => i.status !== "RESOLVED" && i.status !== "REJECTED");

  return (
    <div className="space-y-6">
      {/* Header matching reference */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E9E7] dark:border-[#18221D] pb-5 transition-colors duration-150">
        <div>
          <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#74827A] dark:text-[#6C7B73] block">
            EMPLOYEE WORKSPACE
          </span>
          <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-[#1A1D18] dark:text-[#F3F7F4] tracking-tight mt-1">
            Hardware & <span className="text-[#2E8540] dark:text-[#A3FF5F]">Support</span>
          </h1>
          <p className="text-sm text-[#526159] dark:text-[#8E9C94] mt-0.5">
            Your assigned equipment custody, active support tickets, and service requests.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/maintenance/report"
            className="px-4 py-2 rounded-xl bg-[#2E8540] hover:bg-[#236C33] text-white dark:bg-[#A3FF5F] dark:hover:bg-[#8EF04C] dark:text-[#080D0B] font-semibold text-xs tracking-wide shadow-sm dark:shadow-lime-glow flex items-center gap-2 transition-all"
          >
            <Plus size={14} />
            Report Hardware Issue
          </Link>
        </div>
      </div>

      {/* KPI Stats matching reference */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Assigned Hardware */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#0D1511] border border-[#E5E9E7] dark:border-[#1E2B23] relative overflow-hidden flex items-start justify-between shadow-sm dark:shadow-card hover:border-[#CBD5E1] dark:hover:border-[#27382F] transition-colors">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#2E8540] dark:bg-[#A3FF5F] rounded-r-sm" />
          <div className="pl-1.5 space-y-0.5">
            <p className="text-xs text-[#526159] dark:text-[#8E9C94]">Assigned Hardware</p>
            <p className="font-heading text-2xl font-bold text-[#1A1D18] dark:text-white mt-1">
              {assignedAssets.length < 10 ? `0${assignedAssets.length}` : assignedAssets.length}
            </p>
            <p className="text-[11px] font-mono text-[#2E8540] dark:text-[#A3FF5F]">Active in your custody</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#EAF7EE] dark:bg-[#14261B] border border-[#C2E8CE] dark:border-[#234A31] flex items-center justify-center text-[#2E8540] dark:text-[#A3FF5F] shrink-0">
            <Laptop size={17} />
          </div>
        </div>

        {/* Card 2: Active Support Tickets */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#0D1511] border border-[#E5E9E7] dark:border-[#1E2B23] relative overflow-hidden flex items-start justify-between shadow-sm dark:shadow-card hover:border-[#CBD5E1] dark:hover:border-[#27382F] transition-colors">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#D97706] dark:bg-[#FBBF24] rounded-r-sm" />
          <div className="pl-1.5 space-y-0.5">
            <p className="text-xs text-[#526159] dark:text-[#8E9C94]">Active Support Tickets</p>
            <p className="font-heading text-2xl font-bold text-[#1A1D18] dark:text-white mt-1">
              {activeIssues.length < 10 ? `0${activeIssues.length}` : activeIssues.length}
            </p>
            <p className="text-[11px] font-mono text-[#D97706] dark:text-[#FBBF24]">Open service issues</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#FEF6E7] dark:bg-[#262010] border border-[#FDE6B8] dark:border-[#483B19] flex items-center justify-center text-[#D97706] dark:text-[#FBBF24] shrink-0">
            <Wrench size={17} />
          </div>
        </div>

        {/* Card 3: Resolved Issues */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#0D1511] border border-[#E5E9E7] dark:border-[#1E2B23] relative overflow-hidden flex items-start justify-between shadow-sm dark:shadow-card hover:border-[#CBD5E1] dark:hover:border-[#27382F] transition-colors">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#0D9488] dark:bg-[#55D6BE] rounded-r-sm" />
          <div className="pl-1.5 space-y-0.5">
            <p className="text-xs text-[#526159] dark:text-[#8E9C94]">Resolved Issues</p>
            <p className="font-heading text-2xl font-bold text-[#1A1D18] dark:text-white mt-1">
              {myIssues.filter((i) => i.status === "RESOLVED").length < 10
                ? `0${myIssues.filter((i) => i.status === "RESOLVED").length}`
                : myIssues.filter((i) => i.status === "RESOLVED").length}
            </p>
            <p className="text-[11px] font-mono text-[#0D9488] dark:text-[#55D6BE]">Successfully closed</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#E6F9F6] dark:bg-[#14261B] border border-[#BCEEE7] dark:border-[#234A31] flex items-center justify-center text-[#0D9488] dark:text-[#55D6BE] shrink-0">
            <CheckCircle2 size={17} />
          </div>
        </div>

        {/* Card 4: Hardware Status */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#0D1511] border border-[#E5E9E7] dark:border-[#1E2B23] relative overflow-hidden flex items-start justify-between shadow-sm dark:shadow-card hover:border-[#CBD5E1] dark:hover:border-[#27382F] transition-colors">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#7C3AED] dark:bg-[#A78BFA] rounded-r-sm" />
          <div className="pl-1.5 space-y-0.5">
            <p className="text-xs text-[#526159] dark:text-[#8E9C94]">Hardware Status</p>
            <p className="font-heading text-2xl font-bold text-[#1A1D18] dark:text-white mt-1">Healthy</p>
            <p className="text-[11px] font-mono text-[#7C3AED] dark:text-[#A78BFA]">Verified policy</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#F5F3FF] dark:bg-[#20152B] border border-[#DDD6FE] dark:border-[#3D2652] flex items-center justify-center text-[#7C3AED] dark:text-[#A78BFA] shrink-0">
            <ShieldCheck size={17} />
          </div>
        </div>
      </div>

      {/* Main Content Grid: Assigned Hardware (7 cols) + Service Tickets (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Assigned Hardware */}
        <div className="lg:col-span-7 p-5 rounded-xl bg-white dark:bg-[#0D1511] border border-[#E5E9E7] dark:border-[#1E2B23] shadow-sm dark:shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E9E7] dark:border-[#18221D] pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#EAF7EE] dark:bg-[#14261B] border border-[#C2E8CE] dark:border-[#234A31] flex items-center justify-center text-[#2E8540] dark:text-[#A3FF5F]">
                <Laptop size={15} />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-sm text-[#1A1D18] dark:text-white">Assigned Equipment</h3>
                <p className="text-[11px] text-[#526159] dark:text-[#8E9C94]">Hardware allocated to your enterprise account</p>
              </div>
            </div>
            <Link to="/assets" className="text-xs font-medium text-[#2E8540] dark:text-[#A3FF5F] hover:underline flex items-center gap-1">
              View all <ArrowRight size={13} />
            </Link>
          </div>

          <div className="space-y-3">
            {assignedAssets.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#74827A] dark:text-[#6C7B73]">
                No hardware assets currently assigned to your account.
              </div>
            ) : (
              assignedAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="p-3.5 rounded-xl bg-[#F8FAF9] dark:bg-[#080D0B] border border-[#E5E9E7] dark:border-[#18221D] flex items-center justify-between gap-4 hover:border-[#CBD5E1] dark:hover:border-[#27382F] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-[#EAF7EE] dark:bg-[#14261B] border border-[#C2E8CE] dark:border-[#234A31] flex items-center justify-center text-[#2E8540] dark:text-[#A3FF5F] shrink-0">
                      <Laptop size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-xs text-[#1A1D18] dark:text-white truncate">{asset.assetName || asset.assetCode}</p>
                      <p className="text-[11px] font-mono text-[#74827A] dark:text-[#6C7B73]">
                        {asset.assetCode} · {asset.category || "Equipment"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <StatusBadge status={asset.status} size="xs" />
                    <Link
                      to="/maintenance/report"
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#0D1511] border border-[#E5E9E7] dark:border-[#1E2B23] hover:border-[#2E8540] dark:hover:border-[#A3FF5F] text-[#526159] dark:text-[#8E9C94] hover:text-[#1A1D18] dark:hover:text-white text-xs font-medium transition-colors shadow-2xs"
                    >
                      Report Issue
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right 5 cols: My Support Tickets */}
        <div className="lg:col-span-5 p-5 rounded-xl bg-white dark:bg-[#0D1511] border border-[#E5E9E7] dark:border-[#1E2B23] shadow-sm dark:shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E9E7] dark:border-[#18221D] pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#FEF6E7] dark:bg-[#262010] border border-[#FDE6B8] dark:border-[#483B19] flex items-center justify-center text-[#D97706] dark:text-[#FBBF24]">
                <Wrench size={15} />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-sm text-[#1A1D18] dark:text-white">Service Requests</h3>
                <p className="text-[11px] text-[#526159] dark:text-[#8E9C94]">Tickets reported by you</p>
              </div>
            </div>
            <Link to="/maintenance" className="text-xs font-medium text-[#2E8540] dark:text-[#A3FF5F] hover:underline flex items-center gap-1">
              View all <ArrowRight size={13} />
            </Link>
          </div>

          <div className="space-y-3">
            {myIssues.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#74827A] dark:text-[#6C7B73]">
                No support tickets filed.
              </div>
            ) : (
              myIssues.slice(0, 5).map((iss) => (
                <div
                  key={iss.id}
                  className="p-3 rounded-xl bg-[#F8FAF9] dark:bg-[#080D0B] border border-[#E5E9E7] dark:border-[#18221D] flex items-center justify-between gap-3 hover:border-[#CBD5E1] dark:hover:border-[#27382F] transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-xs text-[#2E8540] dark:text-[#A3FF5F]">
                        {iss.issueCode || `INC-${iss.id}`}
                      </span>
                      <StatusBadge status={iss.status} size="xs" />
                    </div>
                    <p className="text-xs font-medium text-[#1A1D18] dark:text-[#F3F7F4] truncate mt-1">
                      {iss.title || iss.description}
                    </p>
                    <span className="text-[10px] font-mono text-[#74827A] dark:text-[#6C7B73] block mt-0.5">
                      {formatDate(iss.reportedAt)}
                    </span>
                  </div>

                  <Link
                    to={`/maintenance/${iss.id}`}
                    className="p-1.5 rounded-lg border border-[#E5E9E7] dark:border-[#1E2B23] bg-white dark:bg-transparent hover:bg-[#F4F6F4] dark:hover:bg-[#111A15] text-[#526159] dark:text-[#8E9C94] text-xs transition-colors shrink-0"
                  >
                    <ArrowRight size={13} />
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}