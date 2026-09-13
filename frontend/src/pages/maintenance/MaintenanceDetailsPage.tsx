import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { 
  AlertTriangle, 
  Check, 
  Play, 
  CheckCircle2, 
  ShieldCheck, 
  UserCheck,
  Wrench,
  DollarSign
} from "lucide-react";
import { maintenanceService } from "../../api/maintenanceService";
import { employeeApi } from "../../api/employeeApi";
import type { MaintenanceIssueResponse, MaintenanceWorkOrderResponse, ManagerDecision } from "../../types/maintenance";
import type { EmployeeResponse } from "../../types/employee";
import { useAuthStore } from "../../context/useAuthStore";
import { useToast } from "../../context/ToastContext";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";
import { Textarea } from "../../components/ui/Textarea";
import { Input } from "../../components/ui/Input";
import { Skeleton } from "../../components/ui/Skeleton";
import { formatDate } from "../../utils/formatDate";
import { cn } from "../../utils/cn";

export default function MaintenanceDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addToast } = useToast();

  const [issue, setIssue] = useState<MaintenanceIssueResponse | null>(null);
  const [technicians, setTechnicians] = useState<EmployeeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedTechId, setSelectedTechId] = useState<number | "">("");
  const [assignInstructions, setAssignInstructions] = useState("");

  const [diagNotes, setDiagNotes] = useState("");
  const [actionTaken, setActionTaken] = useState("");
  const [repairCost, setRepairCost] = useState(0);

  const [decisionNotes, setDecisionNotes] = useState("");

  const isAdmin = user?.role === "ROLE_ADMIN";
  const isManager = user?.role === "ROLE_MANAGER";
  const isTechnician = user?.role === "ROLE_TECHNICIAN";

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      if (!id) return;
      setLoading(true);
      setError("");

      const [issueData, empData] = await Promise.all([
        maintenanceService.getIssueById(Number(id)),
        isAdmin || isManager ? employeeApi.getAll().catch(() => []) : Promise.resolve([]),
      ]);

      setIssue(issueData);
      const eList = Array.isArray(empData) ? empData : (empData as any).content || [];
      setTechnicians(eList.filter((e: any) => e.status === "ACTIVE"));
    } catch (err: unknown) {
      if (isAxiosError(err) && err.response?.status === 404) {
        setError("Maintenance ticket not found.");
      } else {
        setError("Failed to load maintenance incident details.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTechnician = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issue || !selectedTechId) return;

    try {
      setActionLoading(true);
      await maintenanceService.assignTechnician(issue.id, {
        technicianId: Number(selectedTechId),
        instructions: assignInstructions.trim() || undefined,
      });
      addToast("success", "Technician dispatched to incident.");
      fetchData();
    } catch (err) {
      addToast("error", "Failed to dispatch technician.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleTechAccept = async (woId: number) => {
    try {
      setActionLoading(true);
      await maintenanceService.respondToWorkOrder(woId, { action: "ACCEPT" });
      addToast("success", "Work order accepted.");
      fetchData();
    } catch (err) {
      addToast("error", "Failed to accept work order.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleTechStart = async (woId: number) => {
    try {
      setActionLoading(true);
      await maintenanceService.startWorkOrder(woId);
      addToast("success", "Diagnostic repair marked in-progress.");
      fetchData();
    } catch (err) {
      addToast("error", "Failed to start repair job.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleTechComplete = async (e: React.FormEvent, woId: number) => {
    e.preventDefault();
    if (!diagNotes.trim() || !actionTaken.trim()) {
      addToast("error", "Please provide diagnosis and action taken summary.");
      return;
    }

    try {
      setActionLoading(true);
      await maintenanceService.completeRepair(woId, {
        isRepairable: true,
        diagnosis: diagNotes.trim(),
        actionTaken: actionTaken.trim(),
        repairCost: repairCost || 0,
      });
      addToast("success", "Repair marked completed and submitted for manager approval.");
      fetchData();
    } catch (err) {
      addToast("error", "Failed to submit repair completion.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleManagerDecision = async (woId: number, decision: ManagerDecision) => {
    try {
      setActionLoading(true);
      await maintenanceService.applyWorkOrderDecision(woId, {
        decision,
        notes: decisionNotes.trim() || undefined,
      });
      addToast("success", `Decision applied: ${decision.replace(/_/g, " ")}`);
      fetchData();
    } catch (err) {
      addToast("error", "Failed to apply manager sign-off.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="p-8 text-center bg-white dark:bg-[#111714] border border-[#E5E9E7] dark:border-[#25312B] rounded-xl max-w-lg mx-auto space-y-3 shadow-sm dark:shadow-card">
        <AlertTriangle className="w-8 h-8 text-red-500 dark:text-red-400 mx-auto" />
        <h3 className="font-heading font-semibold text-sm text-[#1A1D18] dark:text-[#F3F7F4]">{error || "Ticket Not Found"}</h3>
        <Button variant="outline" size="sm" onClick={() => navigate("/maintenance")}>
          ← Return to Board
        </Button>
      </div>
    );
  }

  const latestWorkOrder = issue.workOrders && issue.workOrders.length > 0
    ? issue.workOrders[issue.workOrders.length - 1]
    : null;

  const lifecycleStages = [
    { label: "Reported", status: "REPORTED", done: true },
    { label: "Under Review", status: "UNDER_REVIEW", done: ["UNDER_REVIEW", "ACCEPTED", "IN_PROGRESS", "COMPLETED", "RESOLVED"].includes(issue.status) },
    { label: "Accepted", status: "ACCEPTED", done: ["ACCEPTED", "IN_PROGRESS", "COMPLETED", "RESOLVED"].includes(issue.status) },
    { label: "In Progress", status: "IN_PROGRESS", done: ["IN_PROGRESS", "COMPLETED", "RESOLVED"].includes(issue.status) },
    { label: "Completed", status: "COMPLETED", done: ["COMPLETED", "RESOLVED"].includes(issue.status) },
    { label: "Resolved", status: "RESOLVED", done: issue.status === "RESOLVED" },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader
        breadcrumbs={[
          { label: "Maintenance", href: "/maintenance" },
          { label: issue.issueCode || `INC-${issue.id}` },
        ]}
        title={issue.title || "Incident Ticket"}
        badge={<StatusBadge status={issue.status} size="sm" />}
        description={`Asset: ${issue.assetCode || "—"} · Priority: ${issue.priority} · Logged ${formatDate(issue.reportedAt || (issue as any).createdAt)}`}
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate("/maintenance")}>
            ← Back
          </Button>
        }
      />

      {/* Lifecycle Progress Bar */}
      <div className="p-4 bg-white dark:bg-[#111714] border border-[#E5E9E7] dark:border-[#25312B] rounded-xl space-y-3 shadow-sm dark:shadow-card">
        <h3 className="font-heading font-semibold text-2xs uppercase tracking-wider text-[#526159] dark:text-[#87948C]">
          Workflow State Machine
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
          {lifecycleStages.map((st, i) => (
            <div
              key={i}
              className={cn(
                "p-2.5 rounded-lg border text-center font-mono text-2xs transition-colors",
                st.done
                  ? "bg-[#E8F8EE] dark:bg-[#A3FF5F]/15 border-[#C2E8CE] dark:border-[#A3FF5F]/30 text-[#1E6B30] dark:text-[#A3FF5F] font-bold"
                  : "bg-[#F4F6F4] dark:bg-[#151C18] border-[#E5E9E7] dark:border-[#25312B] text-[#526159] dark:text-[#87948C]"
              )}
            >
              <div className="flex items-center justify-center gap-1">
                {st.done ? <Check size={11} className="text-[#1E6B30] dark:text-[#A3FF5F] stroke-[3]" /> : <span className="w-1.5 h-1.5 rounded-full bg-[#CBD5E1] dark:bg-[#25312B]" />}
                <span>{st.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Issue Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-white dark:bg-[#111714] border border-[#E5E9E7] dark:border-[#25312B] rounded-xl space-y-4 shadow-sm dark:shadow-card">
          <h3 className="font-heading font-semibold text-xs text-[#1A1D18] dark:text-[#F3F7F4] uppercase tracking-wider border-b border-[#E5E9E7] dark:border-[#25312B] pb-2">
            Incident Description
          </h3>
          <p className="text-xs text-[#526159] dark:text-[#C0CCC5] bg-[#F8FAF9] dark:bg-[#151C18] p-3 rounded-lg border border-[#E5E9E7] dark:border-[#25312B] font-mono">
            {issue.description || "No detailed fault notes provided."}
          </p>
          <div className="grid grid-cols-2 gap-4 text-xs pt-2">
            <div>
              <p className="text-2xs font-mono text-[#526159] dark:text-[#87948C] uppercase">Reported By</p>
              <p className="font-medium text-[#1A1D18] dark:text-[#F3F7F4] mt-0.5">{issue.reportedByName || "Staff"}</p>
            </div>
            <div>
              <p className="text-2xs font-mono text-[#526159] dark:text-[#87948C] uppercase">Reported Date</p>
              <p className="font-mono text-[#1A1D18] dark:text-[#F3F7F4] mt-0.5">{formatDate(issue.reportedAt || (issue as any).createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Assigned Technician Work Order Box */}
        <div className="p-4 bg-white dark:bg-[#111714] border border-[#E5E9E7] dark:border-[#25312B] rounded-xl space-y-4 shadow-sm dark:shadow-card">
          <h3 className="font-heading font-semibold text-xs text-[#1A1D18] dark:text-[#F3F7F4] uppercase tracking-wider border-b border-[#E5E9E7] dark:border-[#25312B] pb-2">
            Technician Assignment
          </h3>
          {latestWorkOrder ? (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xs font-mono text-[#526159] dark:text-[#87948C] uppercase">Work Order Code</p>
                  <p className="font-mono font-semibold text-[#2E8540] dark:text-[#A3FF5F] text-sm mt-0.5">{latestWorkOrder.workOrderCode || `WO-${latestWorkOrder.id}`}</p>
                </div>
                <StatusBadge status={latestWorkOrder.status} size="xs" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-2xs font-mono text-[#526159] dark:text-[#87948C] uppercase">Technician</p>
                  <p className="font-medium text-[#1A1D18] dark:text-[#F3F7F4] mt-0.5">{latestWorkOrder.technicianName || "Tech"}</p>
                </div>
                <div>
                  <p className="text-2xs font-mono text-[#526159] dark:text-[#87948C] uppercase">Repair Cost</p>
                  <p className="font-mono font-semibold text-[#1A1D18] dark:text-[#F3F7F4] mt-0.5">
                    ${latestWorkOrder.repairCost ? latestWorkOrder.repairCost.toFixed(2) : "0.00"}
                  </p>
                </div>
              </div>

              {latestWorkOrder.diagnosis && (
                <div>
                  <p className="text-2xs font-mono text-[#526159] dark:text-[#87948C] uppercase">Diagnosis Notes</p>
                  <p className="text-2xs text-[#526159] dark:text-[#C0CCC5] bg-[#F8FAF9] dark:bg-[#151C18] border border-[#E5E9E7] dark:border-[#25312B] p-2 rounded-lg font-mono mt-0.5">
                    {latestWorkOrder.diagnosis}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-[#74827A] dark:text-[#87948C]">
              No technician assigned to this maintenance ticket yet.
            </div>
          )}
        </div>
      </div>

      {/* Role Context Action Benches */}
      {(isAdmin || isManager) && (issue.status === "REPORTED" || issue.status === "UNDER_REVIEW") && (
        <div className="p-5 bg-white dark:bg-[#111714] border border-[#E5E9E7] dark:border-[#25312B] rounded-xl space-y-4 shadow-sm dark:shadow-card">
          <div className="flex items-center gap-2 border-b border-[#E5E9E7] dark:border-[#25312B] pb-2">
            <UserCheck size={16} className="text-[#2E8540] dark:text-[#A3FF5F]" />
            <h3 className="font-heading font-semibold text-xs text-[#1A1D18] dark:text-[#F3F7F4] uppercase tracking-wider">
              Dispatch Technician Work Order
            </h3>
          </div>

          <form onSubmit={handleAssignTechnician} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Select Available Technician *"
                value={selectedTechId}
                onChange={(e) => setSelectedTechId(e.target.value ? Number(e.target.value) : "")}
                required
              >
                <option value="">-- Choose Field Technician --</option>
                {technicians.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.firstName} {t.lastName} ({t.email})
                  </option>
                ))}
              </Select>

              <Input
                label="Dispatch Instructions / Priority Remarks"
                value={assignInstructions}
                onChange={(e) => setAssignInstructions(e.target.value)}
                placeholder="Check thermal paste, test motherboard VRM, replace battery..."
              />
            </div>

            <div className="flex justify-end">
              <Button variant="primary" size="sm" type="submit" loading={actionLoading} disabled={!selectedTechId}>
                Assign & Dispatch Technician
              </Button>
            </div>
          </form>
        </div>
      )}

      {latestWorkOrder && (isTechnician || isAdmin) && (
        <div className="p-5 bg-white dark:bg-[#111714] border border-[#E5E9E7] dark:border-[#25312B] rounded-xl space-y-4 shadow-sm dark:shadow-card">
          <div className="flex items-center gap-2 border-b border-[#E5E9E7] dark:border-[#25312B] pb-2">
            <Wrench size={16} className="text-[#2E8540] dark:text-[#A3FF5F]" />
            <h3 className="font-heading font-semibold text-xs text-[#1A1D18] dark:text-[#F3F7F4] uppercase tracking-wider">
              Technician Diagnostic Workbench
            </h3>
          </div>

          {latestWorkOrder.status === "PENDING_ACCEPTANCE" && (
            <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg">
              <span className="text-xs text-amber-800 dark:text-amber-300">
                This repair ticket is pending your operational acceptance.
              </span>
              <Button variant="primary" size="sm" onClick={() => handleTechAccept(latestWorkOrder.id)} loading={actionLoading} icon={<Check size={13} />}>
                Accept Work Order
              </Button>
            </div>
          )}

          {latestWorkOrder.status === "ACCEPTED" && (
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg">
              <span className="text-xs text-blue-800 dark:text-blue-300">
                Ticket accepted. Begin physical teardown and diagnostics.
              </span>
              <Button variant="primary" size="sm" onClick={() => handleTechStart(latestWorkOrder.id)} loading={actionLoading} icon={<Play size={13} />}>
                Start Diagnostics
              </Button>
            </div>
          )}

          {latestWorkOrder.status === "IN_PROGRESS" && (
            <form onSubmit={(e) => handleTechComplete(e, latestWorkOrder.id)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Textarea
                  label="Diagnostic Observations *"
                  value={diagNotes}
                  onChange={(e) => setDiagNotes(e.target.value)}
                  placeholder="Battery swelled, replaced charging IC on motherboard..."
                  required
                />
                <Textarea
                  label="Action Taken / Resolution *"
                  value={actionTaken}
                  onChange={(e) => setActionTaken(e.target.value)}
                  placeholder="Replaced OEM 75Wh battery and stress-tested charging circuit..."
                  required
                />
              </div>

              <div className="w-48">
                <Input
                  label="Repair Parts / Labor Cost ($)"
                  type="number"
                  step="0.01"
                  value={repairCost}
                  onChange={(e) => setRepairCost(parseFloat(e.target.value) || 0)}
                  startIcon={<DollarSign size={13} />}
                />
              </div>

              <div className="flex justify-end">
                <Button variant="primary" size="sm" type="submit" loading={actionLoading} icon={<CheckCircle2 size={14} />}>
                  Complete Repair & Submit for Sign-off
                </Button>
              </div>
            </form>
          )}
        </div>
      )}

      {latestWorkOrder && latestWorkOrder.status === "COMPLETED" && (isAdmin || isManager) && (
        <div className="p-5 bg-white dark:bg-[#111714] border border-[#E5E9E7] dark:border-[#25312B] rounded-xl space-y-4 shadow-sm dark:shadow-card">
          <div className="flex items-center gap-2 border-b border-[#E5E9E7] dark:border-[#25312B] pb-2">
            <ShieldCheck size={16} className="text-[#2E8540] dark:text-[#A3FF5F]" />
            <h3 className="font-heading font-semibold text-xs text-[#1A1D18] dark:text-[#F3F7F4] uppercase tracking-wider">
              Manager Quality Assurance & Approval
            </h3>
          </div>

          <div className="p-3 bg-[#F8FAF9] dark:bg-[#151C18] border border-[#E5E9E7] dark:border-[#25312B] rounded-lg text-xs space-y-1">
            <p className="font-semibold text-[#1A1D18] dark:text-[#F3F7F4]">
              Technician completed work: {latestWorkOrder.actionTaken}
            </p>
            <p className="font-mono text-2xs text-[#526159] dark:text-[#87948C]">
              Total Incurred Cost: ${latestWorkOrder.repairCost?.toFixed(2) || "0.00"}
            </p>
          </div>

          <Textarea
            label="Manager Resolution Notes (Optional)"
            value={decisionNotes}
            onChange={(e) => setDecisionNotes(e.target.value)}
            placeholder="Approved for redeployment to active inventory..."
            rows={2}
          />

          <div className="flex items-center justify-end gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleManagerDecision(latestWorkOrder.id, "REPLACE")}
              loading={actionLoading}
            >
              Order Replacement
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleManagerDecision(latestWorkOrder.id, "APPROVE_REPAIR")}
              loading={actionLoading}
              icon={<Check size={13} />}
            >
              Approve Repair & Close Incident
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}