import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { Edit, AlertTriangle } from "lucide-react";
import { assetApi } from "../../api/assetApi";
import { maintenanceService } from "../../api/maintenanceService";
import type { AssetResponse } from "../../types/asset";
import type { MaintenanceHistoryResponse } from "../../types/maintenance";
import { useAuthStore } from "../../context/useAuthStore";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { Tabs } from "../../components/ui/Tabs";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import { formatDate } from "../../utils/formatDate";

export default function AssetDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [asset, setAsset] = useState<AssetResponse | null>(null);
  const [history, setHistory] = useState<MaintenanceHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  const canEdit = ["ROLE_ADMIN", "ROLE_MANAGER"].includes(user?.role || "");

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      if (!id) return;
      setLoading(true);
      setError("");

      const [assetData, historyData] = await Promise.all([
        assetApi.getById(Number(id)),
        maintenanceService.getAssetHistory(Number(id)).catch(() => null),
      ]);

      setAsset(assetData);
      setHistory(historyData);
    } catch (err: unknown) {
      if (isAxiosError(err) && err.response?.status === 404) {
        setError("Hardware asset not found in database.");
      } else {
        setError("Failed to load asset details.");
      }
    } finally {
      setLoading(false);
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

  if (error || !asset) {
    return (
      <div className="p-8 text-center bg-white dark:bg-[#111714] border border-[#E5E9E7] dark:border-[#25312B] rounded-xl max-w-lg mx-auto space-y-3 shadow-sm dark:shadow-card">
        <AlertTriangle className="w-8 h-8 text-red-500 dark:text-red-400 mx-auto" />
        <h3 className="font-heading font-semibold text-sm text-[#1A1D18] dark:text-[#F3F7F4]">{error || "Asset Not Found"}</h3>
        <Button variant="outline" size="sm" onClick={() => navigate("/assets")}>
          ← Return to Directory
        </Button>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview & Specs" },
    { id: "custody", label: "Custody & Assignment" },
    { id: "financial", label: "Financial & Warranty" },
    { id: "maintenance", label: `Maintenance History (${history?.issues?.length || 0})` },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader
        breadcrumbs={[
          { label: "Assets", href: "/assets" },
          { label: asset.assetCode || `AST-${asset.id}` },
        ]}
        title={asset.assetName}
        badge={<StatusBadge status={asset.status} size="sm" />}
        description={`S/N: ${asset.serialNumber} · Category: ${asset.category?.replace(/_/g, " ")}`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/assets")}>
              ← Back
            </Button>
            {canEdit && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(`/assets/${asset.id}/edit`)}
                icon={<Edit size={14} />}
              >
                Edit Asset
              </Button>
            )}
          </div>
        }
      />

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white dark:bg-[#111714] border border-[#E5E9E7] dark:border-[#25312B] rounded-xl space-y-4 shadow-sm dark:shadow-card">
            <h3 className="font-heading font-semibold text-xs text-[#1A1D18] dark:text-[#F3F7F4] uppercase tracking-wider border-b border-[#E5E9E7] dark:border-[#25312B] pb-2">
              Device Specifications
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-2xs font-mono text-[#526159] dark:text-[#87948C] uppercase">Manufacturer</p>
                <p className="font-semibold text-[#1A1D18] dark:text-[#F3F7F4] mt-0.5">{asset.brand}</p>
              </div>
              <div>
                <p className="text-2xs font-mono text-[#526159] dark:text-[#87948C] uppercase">Model</p>
                <p className="font-semibold text-[#1A1D18] dark:text-[#F3F7F4] mt-0.5">{asset.model}</p>
              </div>
              <div>
                <p className="text-2xs font-mono text-[#526159] dark:text-[#87948C] uppercase">Serial Number</p>
                <p className="font-mono text-[#1A1D18] dark:text-[#F3F7F4] mt-0.5">{asset.serialNumber}</p>
              </div>
              <div>
                <p className="text-2xs font-mono text-[#526159] dark:text-[#87948C] uppercase">Category</p>
                <p className="font-medium text-[#1A1D18] dark:text-[#F3F7F4] mt-0.5">{asset.category?.replace(/_/g, " ")}</p>
              </div>
            </div>
            {asset.description && (
              <div className="pt-2">
                <p className="text-2xs font-mono text-[#526159] dark:text-[#87948C] uppercase">Hardware Description</p>
                <p className="text-[#526159] dark:text-[#C0CCC5] mt-1 bg-[#F8FAF9] dark:bg-[#151C18] border border-[#E5E9E7] dark:border-[#25312B] p-2.5 rounded-lg text-xs font-mono">
                  {asset.description}
                </p>
              </div>
            )}
          </div>

          <div className="p-4 bg-white dark:bg-[#111714] border border-[#E5E9E7] dark:border-[#25312B] rounded-xl space-y-4 shadow-sm dark:shadow-card">
            <h3 className="font-heading font-semibold text-xs text-[#1A1D18] dark:text-[#F3F7F4] uppercase tracking-wider border-b border-[#E5E9E7] dark:border-[#25312B] pb-2">
              Lifecycle State
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <p className="text-2xs font-mono text-[#526159] dark:text-[#87948C] uppercase">Current Status</p>
                <div className="mt-1">
                  <StatusBadge status={asset.status} size="sm" />
                </div>
              </div>
              <div>
                <p className="text-2xs font-mono text-[#526159] dark:text-[#87948C] uppercase">Assigned Department</p>
                <p className="font-medium text-[#1A1D18] dark:text-[#F3F7F4] mt-0.5">{asset.departmentName || "General Storage"}</p>
              </div>
              <div>
                <p className="text-2xs font-mono text-[#526159] dark:text-[#87948C] uppercase">Current Custodian</p>
                <p className="font-medium text-[#1A1D18] dark:text-[#F3F7F4] mt-0.5">{asset.assignedEmployeeName || "Unallocated (In Storage)"}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "custody" && (
        <div className="p-4 bg-white dark:bg-[#111714] border border-[#E5E9E7] dark:border-[#25312B] rounded-xl space-y-4 shadow-sm dark:shadow-card">
          <h3 className="font-heading font-semibold text-xs text-[#1A1D18] dark:text-[#F3F7F4] uppercase tracking-wider border-b border-[#E5E9E7] dark:border-[#25312B] pb-2">
            Current Physical Custody
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-2xs font-mono text-[#526159] dark:text-[#87948C] uppercase">Assigned Custodian</p>
              <p className="font-semibold text-[#1A1D18] dark:text-[#F3F7F4] text-sm mt-0.5">
                {asset.assignedEmployeeName || "No employee assigned"}
              </p>
            </div>
            <div>
              <p className="text-2xs font-mono text-[#526159] dark:text-[#87948C] uppercase">Assigned Department</p>
              <p className="font-semibold text-[#1A1D18] dark:text-[#F3F7F4] text-sm mt-0.5">
                {asset.departmentName || "General IT Storage"}
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "financial" && (
        <div className="p-4 bg-white dark:bg-[#111714] border border-[#E5E9E7] dark:border-[#25312B] rounded-xl space-y-4 shadow-sm dark:shadow-card">
          <h3 className="font-heading font-semibold text-xs text-[#1A1D18] dark:text-[#F3F7F4] uppercase tracking-wider border-b border-[#E5E9E7] dark:border-[#25312B] pb-2">
            Procurement & Warranty Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <p className="text-2xs font-mono text-[#526159] dark:text-[#87948C] uppercase">Purchase Date</p>
              <p className="font-mono text-[#1A1D18] dark:text-[#F3F7F4] mt-0.5">{formatDate(asset.purchaseDate)}</p>
            </div>
            <div>
              <p className="text-2xs font-mono text-[#526159] dark:text-[#87948C] uppercase">Purchase Price</p>
              <p className="font-mono font-semibold text-[#1A1D18] dark:text-[#F3F7F4] mt-0.5">
                ${asset.purchaseCost ? asset.purchaseCost.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "0.00"}
              </p>
            </div>
            <div>
              <p className="text-2xs font-mono text-[#526159] dark:text-[#87948C] uppercase">Warranty Expiry</p>
              <p className="font-mono text-[#1A1D18] dark:text-[#F3F7F4] mt-0.5">{formatDate(asset.warrantyExpiry)}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "maintenance" && (
        <div className="p-4 bg-white dark:bg-[#111714] border border-[#E5E9E7] dark:border-[#25312B] rounded-xl space-y-3 shadow-sm dark:shadow-card">
          <h3 className="font-heading font-semibold text-xs text-[#1A1D18] dark:text-[#F3F7F4] uppercase tracking-wider border-b border-[#E5E9E7] dark:border-[#25312B] pb-2">
            Maintenance History
          </h3>
          {(!history?.issues || history.issues.length === 0) ? (
            <p className="text-xs text-[#74827A] dark:text-[#87948C] py-6 text-center">No maintenance incidents recorded for this device.</p>
          ) : (
            <div className="divide-y divide-[#E5E9E7] dark:divide-[#25312B]">
              {history.issues.map((iss) => (
                <div key={iss.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-[#2E8540] dark:text-[#A3FF5F]">{iss.issueCode || `INC-${iss.id}`}</span>
                      <span className="font-medium text-[#1A1D18] dark:text-[#F3F7F4]">{iss.title || "Incident"}</span>
                      <StatusBadge status={iss.status} size="xs" />
                    </div>
                    <p className="text-2xs text-[#526159] dark:text-[#87948C] mt-0.5">
                      Reported by {iss.reportedByName} on {formatDate(iss.reportedAt)}
                    </p>
                  </div>
                  <Button variant="outline" size="xs" onClick={() => navigate(`/maintenance/${iss.id}`)}>
                    View Incident
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}