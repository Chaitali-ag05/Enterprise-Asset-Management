import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { AlertTriangle, Save } from "lucide-react";
import { departmentService, type DepartmentRequest } from "../../api/departmentService";
import { useAuthStore } from "../../context/useAuthStore";
import { useToast } from "../../context/ToastContext";
import { PageHeader } from "../../components/ui/PageHeader";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";

export default function DepartmentFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addToast } = useToast();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<DepartmentRequest>({
    name: "",
  });

  useEffect(() => {
    if (user?.role !== "ROLE_ADMIN") {
      navigate("/departments");
      return;
    }
    if (isEdit) {
      fetchDepartment();
    }
  }, [id, user]);

  const fetchDepartment = async () => {
    try {
      const data = await departmentService.getById(Number(id));
      setFormData({
        name: data.name || "",
      });
    } catch (err) {
      setError("Failed to load department.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Please specify the department name.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      if (isEdit) {
        await departmentService.update(Number(id), formData);
        addToast("success", "Department updated.");
      } else {
        await departmentService.create(formData);
        addToast("success", "Department created.");
      }
      navigate("/departments");
    } catch (err: unknown) {
      if (isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to save department.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        breadcrumbs={[
          { label: "Departments", href: "/departments" },
          { label: isEdit ? "Edit Department" : "New Department" },
        ]}
        title={isEdit ? `Edit: ${formData.name}` : "Create Department"}
        description="Establish organizational business units for headcount and equipment allocation."
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate("/departments")}>
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
          <Input
            label="Department Name *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Infrastructure Engineering"
            required
          />
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" size="sm" type="button" onClick={() => navigate("/departments")}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" loading={saving} icon={<Save size={14} />}>
            {isEdit ? "Save Changes" : "Create Department"}
          </Button>
        </div>
      </form>
    </div>
  );
}