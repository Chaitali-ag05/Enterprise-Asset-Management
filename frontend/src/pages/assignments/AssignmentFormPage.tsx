import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { AlertTriangle, Check, Save } from "lucide-react";
import { assignmentService } from "../../api/assignmentService";
import type { AssignmentRequest } from "../../types/assignment";
import { assetApi } from "../../api/assetApi";
import { employeeApi } from "../../api/employeeApi";
import type { EmployeeResponse } from "../../types/employee";
import type { AssetResponse } from "../../types/asset";
import { useAuthStore } from "../../context/useAuthStore";
import { useToast } from "../../context/ToastContext";
import { PageHeader } from "../../components/ui/PageHeader";
import { Select } from "../../components/ui/Select";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { Button } from "../../components/ui/Button";
import { cn } from "../../utils/cn";

export default function AssignmentFormPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addToast } = useToast();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  
  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
  const [assets, setAssets] = useState<AssetResponse[]>([]);
  
  const [employeeId, setEmployeeId] = useState<number | "">("");
  const [expectedReturnDate, setExpectedReturnDate] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedAssetIds, setSelectedAssetIds] = useState<number[]>([]);

  useEffect(() => {
    if (user && !["ROLE_ADMIN", "ROLE_MANAGER"].includes(user.role)) {
      navigate("/assignments");
      return;
    }
    fetchAuxData();
  }, [user]);

  const fetchAuxData = async () => {
    try {
      const [eRes, aRes] = await Promise.all([
        employeeApi.getAll(),
        assetApi.getAll()
      ]);
      const eList = Array.isArray(eRes) ? eRes : (eRes as any).content || [];
      const aList = Array.isArray(aRes) ? aRes : (aRes as any).content || [];
      
      setEmployees(eList.filter((e: any) => e.status === "ACTIVE"));
      setAssets(aList.filter((a: any) => a.status === "AVAILABLE"));
    } catch (err) {
      setError("Failed to load active employees or available assets.");
    }
  };

  const toggleAssetSelection = (assetId: number) => {
    setSelectedAssetIds((prev) =>
      prev.includes(assetId) ? prev.filter((id) => id !== assetId) : [...prev, assetId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) {
      setError("Please select an employee to allocate equipment.");
      return;
    }
    if (selectedAssetIds.length === 0) {
      setError("Please select at least one available hardware asset.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      
      const payload: AssignmentRequest = {
        employeeId: Number(employeeId),
        assetIds: selectedAssetIds,
        expectedReturnDate: expectedReturnDate || null,
        notes: notes.trim() || null,
      };

      await assignmentService.create(payload);
      addToast("success", "Hardware allocation created successfully.");
      navigate("/assignments");
    } catch (err: unknown) {
      if (isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to create assignment.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        breadcrumbs={[
          { label: "Assignments", href: "/assignments" },
          { label: "New Allocation" },
        ]}
        title="Hardware Asset Allocation"
        description="Check out available storage hardware to active personnel with optional return horizons."
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate("/assignments")}>
            Cancel
          </Button>
        }
      />

      {error && (
        <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-2.5 text-red-600 dark:text-red-400 text-xs">
          <AlertTriangle size={15} className="shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-5 bg-white dark:bg-[#111714] border border-[#E5E9E7] dark:border-[#25312B] rounded-xl space-y-4 shadow-sm dark:shadow-card">
          <h3 className="font-heading font-semibold text-xs text-[#1A1D18] dark:text-[#F3F7F4] uppercase tracking-wider border-b border-[#E5E9E7] dark:border-[#25312B] pb-2">
            1. Custodian & Terms
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Select Employee Custodian *"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value ? Number(e.target.value) : "")}
              required
            >
              <option value="">-- Choose Active Personnel --</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName} ({emp.departmentName || "Dept"} · {emp.email})
                </option>
              ))}
            </Select>

            <Input
              label="Expected Return Date (Optional)"
              type="date"
              value={expectedReturnDate}
              onChange={(e) => setExpectedReturnDate(e.target.value)}
              helperText="Target return date if temporary loan"
            />
          </div>

          <Textarea
            label="Allocation Notes / Purpose"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Project deployment, onboarding package, or remote equipment loan..."
            rows={2}
          />
        </div>

        <div className="p-5 bg-white dark:bg-[#111714] border border-[#E5E9E7] dark:border-[#25312B] rounded-xl space-y-3 shadow-sm dark:shadow-card">
          <div className="flex items-center justify-between border-b border-[#E5E9E7] dark:border-[#25312B] pb-2">
            <div>
              <h3 className="font-heading font-semibold text-xs text-[#1A1D18] dark:text-[#F3F7F4] uppercase tracking-wider">
                2. Select Available Assets ({selectedAssetIds.length} Selected)
              </h3>
              <p className="text-2xs text-[#526159] dark:text-[#87948C]">
                Only unallocated deployable hardware items in storage are eligible
              </p>
            </div>
            {selectedAssetIds.length > 0 && (
              <Button
                variant="ghost"
                size="xs"
                type="button"
                onClick={() => setSelectedAssetIds([])}
                className="text-2xs text-[#2E8540] dark:text-[#A3FF5F] hover:text-[#236C33] dark:hover:text-[#8EF04C]"
              >
                Clear Selection
              </Button>
            )}
          </div>

          {assets.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#74827A] dark:text-[#87948C]">
              No hardware assets currently available in storage.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto p-1">
              {assets.map((asset) => {
                const isSelected = selectedAssetIds.includes(asset.id);
                return (
                  <div
                    key={asset.id}
                    onClick={() => toggleAssetSelection(asset.id)}
                    className={cn(
                      "p-3 rounded-lg border text-left cursor-pointer transition-all duration-100 flex items-start justify-between gap-2 select-none",
                      isSelected
                        ? "border-[#2E8540] dark:border-[#A3FF5F] bg-[#E8F8EE] dark:bg-[#A3FF5F]/10 ring-1 ring-[#2E8540] dark:ring-[#A3FF5F]"
                        : "border-[#E5E9E7] dark:border-[#25312B] bg-[#F8FAF9] dark:bg-[#151C18] hover:border-[#2E8540]/40 dark:hover:border-[#A3FF5F]/40"
                    )}
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-xs text-[#1A1D18] dark:text-[#F3F7F4] truncate">
                        {asset.assetName}
                      </p>
                      <p className="text-[11px] font-mono text-[#526159] dark:text-[#87948C] truncate">
                        Tag: {asset.assetCode || `AST-${asset.id}`}
                      </p>
                      <p className="text-2xs text-[#74827A] dark:text-[#C0CCC5] mt-0.5 truncate">
                        {asset.brand} {asset.model}
                      </p>
                    </div>

                    <div
                      className={cn(
                        "w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5",
                        isSelected
                          ? "bg-[#2E8540] dark:bg-[#A3FF5F] border-[#2E8540] dark:border-[#A3FF5F] text-white dark:text-[#080D0B]"
                          : "border-[#E5E9E7] dark:border-[#25312B] bg-white dark:bg-[#0D1210]"
                      )}
                    >
                      {isSelected && <Check size={11} className="stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" size="sm" type="button" onClick={() => navigate("/assignments")}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            loading={saving}
            disabled={selectedAssetIds.length === 0 || !employeeId}
            icon={<Save size={14} />}
          >
            Create Allocation ({selectedAssetIds.length} Assets)
          </Button>
        </div>
      </form>
    </div>
  );
}