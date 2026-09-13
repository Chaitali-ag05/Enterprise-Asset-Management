import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { AlertTriangle, Send } from "lucide-react";
import { maintenanceService } from "../../api/maintenanceService";
import { assetApi } from "../../api/assetApi";
import { employeeApi } from "../../api/employeeApi";
import type { AssetResponse } from "../../types/asset";
import type { IssuePriority } from "../../types/maintenance";
import { useAuthStore } from "../../context/useAuthStore";
import { useNotifications } from "../../context/NotificationContext";
import { useToast } from "../../context/ToastContext";
import { PageHeader } from "../../components/ui/PageHeader";
import { Select } from "../../components/ui/Select";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { Button } from "../../components/ui/Button";

const PRIORITIES: { label: string; value: IssuePriority }[] = [
  { label: "Low (Minor cosmetic / non-blocking)", value: "LOW" },
  { label: "Medium (Workaround available)", value: "MEDIUM" },
  { label: "High (Degraded functionality)", value: "HIGH" },
  { label: "Critical (Total device failure / Work halted)", value: "CRITICAL" },
];

export default function ReportIssuePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { employeeId, loading: empLoading } = useNotifications();
  const { addToast } = useToast();

  const [assets, setAssets] = useState<AssetResponse[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<number | "">("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<IssuePriority>("MEDIUM");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isAdminOrManager = ["ROLE_ADMIN", "ROLE_MANAGER"].includes(user?.role || "");

  useEffect(() => {
    if (!empLoading) {
      fetchAvailableAssets();
    }
  }, [user, employeeId, empLoading]);

  const fetchAvailableAssets = async () => {
    try {
      setLoading(true);
      if (employeeId) {
        const empAssets = await assetApi.getByEmployeeId(employeeId);
        const aList = Array.isArray(empAssets) ? empAssets : (empAssets as any).content || [];
        setAssets(aList);
        if (aList.length > 0) setSelectedAssetId(aList[0].id);
      } else if (isAdminOrManager) {
        const allAssets = await assetApi.getAll();
        const aList = Array.isArray(allAssets) ? allAssets : (allAssets as any).content || [];
        setAssets(aList);
      } else {
        const me = await employeeApi.getMe();
        if (me?.id) {
          const empAssets = await assetApi.getByEmployeeId(me.id);
          const aList = Array.isArray(empAssets) ? empAssets : (empAssets as any).content || [];
          setAssets(aList);
          if (aList.length > 0) setSelectedAssetId(aList[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load assets", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId) {
      setError("Please select the hardware asset experiencing problems.");
      return;
    }
    if (!title.trim() || !description.trim()) {
      setError("Please provide both an issue title and description.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      let repId = employeeId;
      if (!repId) {
        const me = await employeeApi.getMe();
        repId = me.id;
      }

      await maintenanceService.reportIssue({
        assetId: Number(selectedAssetId),
        title: title.trim(),
        description: description.trim(),
        priority,
        reportedById: repId,
      });

      addToast("success", "Hardware incident ticket submitted.");
      navigate("/maintenance");
    } catch (err: unknown) {
      if (isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to submit maintenance incident.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        breadcrumbs={[
          { label: "Maintenance", href: "/maintenance" },
          { label: "Report Fault" },
        ]}
        title="Report Hardware Incident"
        description="Log hardware failures, physical defects, or performance malfunctions for IT diagnostic dispatch."
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate("/maintenance")}>
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

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="p-5 bg-white dark:bg-[#111714] border border-[#E5E9E7] dark:border-[#25312B] rounded-xl space-y-4 shadow-sm dark:shadow-card">
          <Select
            label="Select Affected Hardware Asset *"
            value={selectedAssetId}
            onChange={(e) => setSelectedAssetId(e.target.value ? Number(e.target.value) : "")}
            required
            disabled={loading}
          >
            <option value="">{loading ? "Loading assets..." : "-- Choose Equipment --"}</option>
            {assets.map((a) => (
              <option key={a.id} value={a.id}>
                {a.assetName} ({a.assetCode || `AST-${a.id}`} · S/N: {a.serialNumber})
              </option>
            ))}
          </Select>

          <Input
            label="Incident Summary / Title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Laptop display flickering and failing to boot after sleep"
            required
          />

          <Select
            label="Incident Severity / Priority *"
            value={priority}
            onChange={(e) => setPriority(e.target.value as IssuePriority)}
          >
            {PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </Select>

          <Textarea
            label="Detailed Fault Symptoms & Context *"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please detail exact error codes, physical damage, recent software updates, or steps to reproduce..."
            rows={4}
            required
          />
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" size="sm" type="button" onClick={() => navigate("/maintenance")}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" loading={saving} icon={<Send size={14} />}>
            Submit Incident Report
          </Button>
        </div>
      </form>
    </div>
  );
}