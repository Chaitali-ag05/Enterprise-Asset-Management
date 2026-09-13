import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { RotateCcw, AlertTriangle, X } from "lucide-react";
import { assignmentService } from "../../api/assignmentService";
import type { AssignmentResponse, AssignmentItemResponse } from "../../types/assignment";
import { useAuthStore } from "../../context/useAuthStore";
import { useToast } from "../../context/ToastContext";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import { Textarea } from "../../components/ui/Textarea";
import { formatDate } from "../../utils/formatDate";

export default function AssignmentDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addToast } = useToast();

  const [assignment, setAssignment] = useState<AssignmentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [returnItem, setReturnItem] = useState<AssignmentItemResponse | null>(null);
  const [returnRemarks, setReturnRemarks] = useState("");
  const [returning, setReturning] = useState(false);
  const [returnError, setReturnError] = useState("");

  const canManage = ["ROLE_ADMIN", "ROLE_MANAGER"].includes(user?.role || "");

  useEffect(() => {
    fetchAssignment();
  }, [id]);

  const fetchAssignment = async () => {
    try {
      if (!id) return;
      setLoading(true);
      setError("");
      const data = await assignmentService.getById(Number(id));
      setAssignment(data);
    } catch (err: unknown) {
      if (isAxiosError(err) && err.response?.status === 404) {
        setError("Assignment record not found.");
      } else {
        setError("Failed to load assignment details.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReturnItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignment || !returnItem) return;

    try {
      setReturning(true);
      setReturnError("");
      await assignmentService.returnItem(assignment.id, returnItem.id, returnRemarks.trim());
      addToast("success", `Asset ${returnItem.assetName} checked back into storage inventory.`);
      setReturnItem(null);
      setReturnRemarks("");
      fetchAssignment();
    } catch (err: unknown) {
      if (isAxiosError(err) && err.response?.data?.message) {
        setReturnError(err.response.data.message);
      } else {
        setReturnError("Failed to check in returned asset.");
      }
    } finally {
      setReturning(false);
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

  if (error || !assignment) {
    return (
      <div className="p-8 text-center bg-white dark:bg-[#111714] border border-[#E5E9E7] dark:border-[#25312B] rounded-xl max-w-lg mx-auto space-y-3 shadow-sm dark:shadow-card">
        <AlertTriangle className="w-8 h-8 text-red-500 dark:text-red-400 mx-auto" />
        <h3 className="font-heading font-semibold text-sm text-[#1A1D18] dark:text-[#F3F7F4]">{error || "Allocation Not Found"}</h3>
        <Button variant="outline" size="sm" onClick={() => navigate("/assignments")}>
          ← Return to Assignments
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        breadcrumbs={[
          { label: "Assignments", href: "/assignments" },
          { label: `ASN-${assignment.id.toString().padStart(4, "0")}` },
        ]}
        title={`Allocation for ${assignment.employeeName}`}
        badge={<StatusBadge status={assignment.status} size="sm" />}
        description={`Hardware checkout logged on ${formatDate(assignment.assignedAt)}`}
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate("/assignments")}>
            ← Back
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Custodian Details */}
        <div className="p-4 bg-white dark:bg-[#111714] border border-[#E5E9E7] dark:border-[#25312B] rounded-xl space-y-4 shadow-sm dark:shadow-card">
          <h3 className="font-heading font-semibold text-xs text-[#1A1D18] dark:text-[#F3F7F4] uppercase tracking-wider border-b border-[#E5E9E7] dark:border-[#25312B] pb-2">
            Custodian Profile
          </h3>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-2xs font-mono text-[#526159] dark:text-[#87948C] uppercase">Employee</p>
              <p className="font-semibold text-[#1A1D18] dark:text-[#F3F7F4] mt-0.5">{assignment.employeeName}</p>
            </div>
            <div>
              <p className="text-2xs font-mono text-[#526159] dark:text-[#87948C] uppercase">Department</p>
              <p className="font-medium text-[#1A1D18] dark:text-[#F3F7F4] mt-0.5">{assignment.currentDepartmentName || "General Dept"}</p>
            </div>
            <div>
              <p className="text-2xs font-mono text-[#526159] dark:text-[#87948C] uppercase">Checkout Date</p>
              <p className="font-mono text-[#1A1D18] dark:text-[#F3F7F4] mt-0.5">{formatDate(assignment.assignedAt)}</p>
            </div>
            <div>
              <p className="text-2xs font-mono text-[#526159] dark:text-[#87948C] uppercase">Expected Return</p>
              <p className="font-mono text-[#1A1D18] dark:text-[#F3F7F4] mt-0.5">{assignment.expectedReturnDate ? formatDate(assignment.expectedReturnDate) : "Indefinite Custody"}</p>
            </div>
          </div>
        </div>

        {/* Allocation Notes */}
        <div className="p-4 bg-white dark:bg-[#111714] border border-[#E5E9E7] dark:border-[#25312B] rounded-xl space-y-4 shadow-sm dark:shadow-card">
          <h3 className="font-heading font-semibold text-xs text-[#1A1D18] dark:text-[#F3F7F4] uppercase tracking-wider border-b border-[#E5E9E7] dark:border-[#25312B] pb-2">
            Allocation Purpose & Remarks
          </h3>
          <p className="text-2xs text-[#526159] dark:text-[#C0CCC5] font-mono bg-[#F8FAF9] dark:bg-[#151C18] p-3 rounded-lg border border-[#E5E9E7] dark:border-[#25312B]">
            {assignment.notes || "Standard equipment checkout profile. No custom deployment remarks logged."}
          </p>
        </div>
      </div>

      {/* Allocated Equipment Table */}
      <div className="p-4 bg-white dark:bg-[#111714] border border-[#E5E9E7] dark:border-[#25312B] rounded-xl space-y-3 shadow-sm dark:shadow-card">
        <h3 className="font-heading font-semibold text-xs text-[#1A1D18] dark:text-[#F3F7F4] uppercase tracking-wider border-b border-[#E5E9E7] dark:border-[#25312B] pb-2">
          Hardware Items ({assignment.items?.length || 0})
        </h3>

        <div className="divide-y divide-[#E5E9E7] dark:divide-[#25312B]">
          {assignment.items?.map((item) => (
            <div key={item.id} className="py-3 flex items-center justify-between gap-3 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#1A1D18] dark:text-[#F3F7F4]">
                    {item.assetName}
                  </span>
                  <span className="font-mono text-2xs text-[#2E8540] dark:text-[#A3FF5F] font-semibold">
                    {item.assetCode || `AST-${item.assetId}`}
                  </span>
                  <StatusBadge status={item.status} size="xs" />
                </div>
                {item.remarks && (
                  <p className="text-2xs text-[#526159] dark:text-[#87948C] mt-0.5">
                    Return Note: {item.remarks}
                  </p>
                )}
              </div>

              {canManage && item.status === "ASSIGNED" && (
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => setReturnItem(item)}
                  icon={<RotateCcw size={12} />}
                >
                  Check In Return
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Return Item Modal */}
      {returnItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="fixed inset-0" onClick={() => setReturnItem(null)} />
          <div className="relative w-full max-w-md bg-white dark:bg-[#111714] border border-[#E5E9E7] dark:border-[#25312B] rounded-2xl shadow-2xl p-5 space-y-4 z-10 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#E5E9E7] dark:border-[#25312B] pb-3">
              <h3 className="font-heading font-semibold text-sm text-[#1A1D18] dark:text-[#F3F7F4]">
                Check In Returned Hardware
              </h3>
              <button type="button" onClick={() => setReturnItem(null)} className="text-[#74827A] dark:text-[#87948C] hover:text-[#1A1D18] dark:hover:text-[#F3F7F4] p-1">
                <X size={16} />
              </button>
            </div>

            {returnError && (
              <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg text-2xs text-red-600 dark:text-red-400">
                {returnError}
              </div>
            )}

            <form onSubmit={handleReturnItem} className="space-y-4">
              <div className="text-xs p-3 bg-[#F8FAF9] dark:bg-[#151C18] border border-[#E5E9E7] dark:border-[#25312B] rounded-lg space-y-1">
                <p className="text-[#1A1D18] dark:text-[#F3F7F4] font-semibold">{returnItem.assetName}</p>
                <p className="font-mono text-2xs text-[#2E8540] dark:text-[#A3FF5F]">Tag: {returnItem.assetCode}</p>
              </div>

              <Textarea
                label="Return Condition / Audit Remarks"
                value={returnRemarks}
                onChange={(e) => setReturnRemarks(e.target.value)}
                placeholder="Hardware condition verified, accessories complete, device returned to storage depot..."
                rows={3}
              />

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#E5E9E7] dark:border-[#25312B]">
                <Button variant="outline" size="sm" type="button" onClick={() => setReturnItem(null)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" loading={returning}>
                  Confirm Return Check-In
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}