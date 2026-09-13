import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Truck, X, Save, AlertTriangle } from "lucide-react";
import { vendorApi, type VendorRequest } from "../../api/vendorApi";
import type { VendorResponse } from "../../types/vendor";
import { useAuthStore } from "../../context/useAuthStore";
import { useToast } from "../../context/ToastContext";
import { PageHeader } from "../../components/ui/PageHeader";
import { DataTable, type Column } from "../../components/ui/DataTable";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

export default function VendorListPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addToast } = useToast();
  const [vendors, setVendors] = useState<VendorResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState<VendorRequest>({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
  });

  const isAdmin = user?.role === "ROLE_ADMIN";

  useEffect(() => {
    if (!isAdmin) {
      navigate("/dashboard");
      return;
    }
    fetchVendors();
  }, [isAdmin]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await vendorApi.getAll();
      setVendors(Array.isArray(data) ? data : (data as any).content || []);
    } catch (err) {
      setError("Failed to load procurement vendors.");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditId(null);
    setFormData({ name: "", contactPerson: "", email: "", phone: "", address: "" });
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (vendor: VendorResponse) => {
    setEditId(vendor.id);
    setFormData({
      name: vendor.name,
      contactPerson: vendor.contactPerson || "",
      email: vendor.email || "",
      phone: vendor.phone || "",
      address: vendor.address || "",
    });
    setFormError("");
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email?.trim()) {
      setFormError("Please fill in vendor name and contact email.");
      return;
    }

    try {
      setSaving(true);
      setFormError("");
      if (editId) {
        await vendorApi.update(editId, formData);
        addToast("success", "Vendor profile updated.");
      } else {
        await vendorApi.create(formData);
        addToast("success", "New procurement vendor registered.");
      }
      setModalOpen(false);
      fetchVendors();
    } catch (err: any) {
      setFormError(err.response?.data?.message || "Failed to save vendor.");
    } finally {
      setSaving(false);
    }
  };

  const columns: Column<VendorResponse>[] = [
    {
      key: "name",
      header: "Vendor Entity",
      sortable: true,
      render: (v) => (
        <div className="flex items-center gap-2">
          <Truck size={14} className="text-[#2E8540] dark:text-[#A3FF5F] shrink-0" />
          <span className="font-semibold text-xs text-[#1A1D18] dark:text-white">{v.name}</span>
        </div>
      ),
    },
    {
      key: "contactPerson",
      header: "Representative",
      sortable: true,
      render: (v) => (
        <span className="text-xs text-[#526159] dark:text-[#8E9C94] font-medium">
          {v.contactPerson || "Corporate Representative"}
        </span>
      ),
    },
    {
      key: "email",
      header: "Contact Email",
      render: (v) => <span className="font-mono text-xs text-[#526159] dark:text-[#8E9C94]">{v.email}</span>,
    },
    {
      key: "phone",
      header: "Phone",
      render: (v) => <span className="font-mono text-xs text-[#74827A] dark:text-[#6C7B73]">{v.phone || "—"}</span>,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (v) => <StatusBadge status={v.status || "ACTIVE"} size="xs" />,
    },
    {
      key: "actions",
      header: "",
      className: "text-right w-16",
      render: (v) => (
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={() => openEditModal(v)}
            className="p-1.5 rounded-lg text-[#74827A] hover:text-[#2E8540] dark:hover:text-[#A3FF5F] hover:bg-[#F4F6F4] dark:hover:bg-[#151C18] border border-transparent hover:border-[#E5E9E7] dark:hover:border-[#1E2B23] transition-colors"
            title="Edit Vendor"
          >
            <Edit size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Procurement Vendors & Suppliers"
        description="OEM hardware suppliers, authorized distributors, and procurement contacts."
        actions={
          <Button variant="primary" size="sm" onClick={openCreateModal} icon={<Plus size={14} />}>
            Register Vendor
          </Button>
        }
      />

      {error ? (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400 text-xs">
          <AlertTriangle size={16} />
          <p>{error}</p>
        </div>
      ) : (
        <DataTable
          data={vendors}
          columns={columns}
          loading={loading}
          keyExtractor={(v) => v.id}
          pageSize={10}
          emptyMessage="No hardware vendors configured."
        />
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="fixed inset-0" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-[#111714] border border-[#E5E9E7] dark:border-[#25312B] rounded-2xl shadow-2xl p-5 space-y-4 z-10 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#E5E9E7] dark:border-[#25312B] pb-3">
              <h3 className="font-heading font-semibold text-sm text-[#1A1D18] dark:text-[#F3F7F4]">
                {editId ? "Edit Supplier Record" : "Register Procurement Vendor"}
              </h3>
              <button type="button" onClick={() => setModalOpen(false)} className="text-[#74827A] dark:text-[#87948C] hover:text-[#1A1D18] dark:hover:text-[#F3F7F4] p-1">
                <X size={16} />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg text-2xs text-red-600 dark:text-red-400">
                {formError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <Input
                label="Vendor Enterprise Name *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Dell Enterprise Direct"
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Contact Representative"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  placeholder="e.g. Michael Scott"
                />
                <Input
                  label="Business Email *"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. accounts@supplier.com"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Business Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (800) 555-0199"
                />
                <Input
                  label="Office / Depot Address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="City, Country"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#E5E9E7] dark:border-[#25312B]">
                <Button variant="outline" size="sm" type="button" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" loading={saving} icon={<Save size={14} />}>
                  {editId ? "Update Supplier" : "Register Supplier"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}