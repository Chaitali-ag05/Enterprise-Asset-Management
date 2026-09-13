import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { Save, AlertTriangle } from "lucide-react";
import { assetApi } from "../../api/assetApi";
import { departmentService } from "../../api/departmentService";
import { vendorApi } from "../../api/vendorApi";
import type { AssetRequest, AssetCategory } from "../../types/asset";
import type { DepartmentResponse } from "../../types/department";
import type { VendorResponse } from "../../types/vendor";
import { useAuthStore } from "../../context/useAuthStore";
import { useToast } from "../../context/ToastContext";
import { PageHeader } from "../../components/ui/PageHeader";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Textarea } from "../../components/ui/Textarea";
import { Button } from "../../components/ui/Button";

const CATEGORIES: { label: string; value: AssetCategory }[] = [
  { label: "Laptop", value: "LAPTOP" },
  { label: "Desktop Workstation", value: "DESKTOP" },
  { label: "Monitor / Display", value: "MONITOR" },
  { label: "Network Device", value: "NETWORK_DEVICE" },
  { label: "Printer", value: "PRINTER" },
  { label: "Mobile Device", value: "MOBILE" },
  { label: "Tablet", value: "TABLET" },
  { label: "Other Peripheral", value: "OTHER" },
];

export default function AssetFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addToast } = useToast();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [vendors, setVendors] = useState<VendorResponse[]>([]);

  const [formData, setFormData] = useState<AssetRequest>({
    assetName: "",
    serialNumber: "",
    brand: "",
    model: "",
    description: "",
    purchaseDate: new Date().toISOString().split("T")[0],
    purchaseCost: 0,
    warrantyExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    category: "LAPTOP",
    departmentId: 0,
    assignedEmployeeId: null,
    vendorId: 0,
  });

  useEffect(() => {
    if (user && !["ROLE_ADMIN", "ROLE_MANAGER"].includes(user.role)) {
      navigate("/assets");
      return;
    }
    fetchAuxiliaryData();
    if (isEdit) {
      fetchAsset();
    }
  }, [id]);

  const fetchAuxiliaryData = async () => {
    try {
      const [dRes, vRes] = await Promise.all([
        departmentService.getAll(),
        vendorApi.getAll()
      ]);
      setDepartments(Array.isArray(dRes) ? dRes : (dRes as any).content || []);
      setVendors(Array.isArray(vRes) ? vRes : (vRes as any).content || []);
    } catch (err) {
      console.error("Failed to load departments or vendors", err);
    }
  };

  const fetchAsset = async () => {
    try {
      const data = await assetApi.getById(Number(id));
      setFormData({
        assetName: data.assetName || "",
        serialNumber: data.serialNumber || "",
        brand: data.brand || "",
        model: data.model || "",
        description: data.description || "",
        purchaseDate: data.purchaseDate ? data.purchaseDate.split("T")[0] : "",
        purchaseCost: data.purchaseCost || 0,
        warrantyExpiry: data.warrantyExpiry ? data.warrantyExpiry.split("T")[0] : "",
        category: (data.category as AssetCategory) || "LAPTOP",
        departmentId: data.departmentId || 0,
        assignedEmployeeId: data.assignedEmployeeId || null,
        vendorId: data.vendorId || 0,
      });
    } catch (err) {
      setError("Failed to load asset details.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.assetName.trim() || !formData.serialNumber.trim() || !formData.brand.trim() || !formData.model.trim()) {
      setError("Please fill in all required hardware specifications.");
      return;
    }
    if (!formData.departmentId) {
      setError("Please select a department assignment.");
      return;
    }
    if (!isEdit && !formData.vendorId) {
      setError("Please select a procurement vendor.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      if (isEdit) {
        await assetApi.update(Number(id), formData);
        addToast("success", "Asset specifications updated successfully.");
      } else {
        await assetApi.create(formData);
        addToast("success", "New hardware asset registered.");
      }
      navigate("/assets");
    } catch (err: unknown) {
      if (isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to save asset. Please verify input data.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        breadcrumbs={[
          { label: "Assets", href: "/assets" },
          { label: isEdit ? "Edit Asset" : "New Asset" },
        ]}
        title={isEdit ? `Edit: ${formData.assetName || "Asset"}` : "Register Hardware Asset"}
        description="Enroll new physical IT inventory, assign custody, and track OEM warranties."
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate("/assets")}>
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
            1. Device Identification & Specs
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Hardware Model Name *"
              value={formData.assetName}
              onChange={(e) => setFormData({ ...formData, assetName: e.target.value })}
              placeholder="e.g. ThinkPad T14s Gen 4"
              required
            />
            <Input
              label="OEM Serial Number *"
              value={formData.serialNumber}
              onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
              placeholder="e.g. PF-3ABCD4"
              mono
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Manufacturer / Brand *"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              placeholder="e.g. Lenovo, Apple, Dell"
              required
            />
            <Input
              label="Model Number / SKU *"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              placeholder="e.g. 21F8002VUS"
              required
            />
            <Select
              label="Hardware Category *"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as AssetCategory })}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </Select>
          </div>

          <Textarea
            label="Hardware Specifications / Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="CPU: AMD Ryzen 7 PRO 7840U, RAM: 32GB LPDDR5x, Storage: 1TB NVMe, Screen: 2.8K OLED"
            rows={2}
          />
        </div>

        <div className="p-5 bg-white dark:bg-[#111714] border border-[#E5E9E7] dark:border-[#25312B] rounded-xl space-y-4 shadow-sm dark:shadow-card">
          <h3 className="font-heading font-semibold text-xs text-[#1A1D18] dark:text-[#F3F7F4] uppercase tracking-wider border-b border-[#E5E9E7] dark:border-[#25312B] pb-2">
            2. Procurement & Financials
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Purchase Date *"
              type="date"
              value={formData.purchaseDate}
              onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
              required
            />
            <Input
              label="Purchase Cost ($) *"
              type="number"
              step="0.01"
              value={formData.purchaseCost}
              onChange={(e) => setFormData({ ...formData, purchaseCost: parseFloat(e.target.value) || 0 })}
              required
            />
            <Input
              label="Warranty Expiry Date *"
              type="date"
              value={formData.warrantyExpiry}
              onChange={(e) => setFormData({ ...formData, warrantyExpiry: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Assigned Department *"
              value={formData.departmentId}
              onChange={(e) => setFormData({ ...formData, departmentId: Number(e.target.value) })}
              required
            >
              <option value="0">-- Select Department --</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Select>

            {!isEdit ? (
              <Select
                label="Procurement Vendor *"
                value={formData.vendorId}
                onChange={(e) => setFormData({ ...formData, vendorId: Number(e.target.value) })}
                required
              >
                <option value="0">-- Select Vendor --</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </Select>
            ) : null}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" size="sm" type="button" onClick={() => navigate("/assets")}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" loading={saving} icon={<Save size={14} />}>
            {isEdit ? "Save Changes" : "Register Hardware"}
          </Button>
        </div>
      </form>
    </div>
  );
}