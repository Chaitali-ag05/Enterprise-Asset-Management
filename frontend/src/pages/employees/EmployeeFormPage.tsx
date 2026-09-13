import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { AlertTriangle, Save } from "lucide-react";
import { employeeApi } from "../../api/employeeApi";
import { departmentService } from "../../api/departmentService";
import type { EmployeeRequest, Designation } from "../../types/employee";
import type { DepartmentResponse } from "../../types/department";
import { useAuthStore } from "../../context/useAuthStore";
import { useToast } from "../../context/ToastContext";
import { PageHeader } from "../../components/ui/PageHeader";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Button } from "../../components/ui/Button";

const DESIGNATIONS: { label: string; value: Designation }[] = [
  { label: "Intern", value: "INTERN" },
  { label: "Software Engineer", value: "SOFTWARE_ENGINEER" },
  { label: "Senior Software Engineer", value: "SENIOR_SOFTWARE_ENGINEER" },
  { label: "Team Lead", value: "TEAM_LEAD" },
  { label: "Manager", value: "MANAGER" },
  { label: "HR Specialist", value: "HR" },
  { label: "System Admin", value: "ADMIN" },
];

export default function EmployeeFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addToast } = useToast();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);

  const [formData, setFormData] = useState<EmployeeRequest>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    designation: "SOFTWARE_ENGINEER",
    departmentId: 0,
    managerId: null,
  });

  useEffect(() => {
    if (user?.role !== "ROLE_ADMIN") {
      navigate("/employees");
      return;
    }
    fetchDepartments();
    if (isEdit) {
      fetchEmployee();
    }
  }, [id, user]);

  const fetchDepartments = async () => {
    try {
      const data = await departmentService.getAll();
      setDepartments(Array.isArray(data) ? data : (data as any).content || []);
    } catch (err) {
      console.error("Failed to load departments", err);
    }
  };

  const fetchEmployee = async () => {
    try {
      const emp = await employeeApi.getById(Number(id));
      const depts = await departmentService.getAll();
      const matchedDept = depts.find((d) => d.name === emp.departmentName);

      setFormData({
        firstName: emp.firstName || "",
        lastName: emp.lastName || "",
        email: emp.email || "",
        phone: emp.phone || "",
        designation: (emp.designation as Designation) || "SOFTWARE_ENGINEER",
        departmentId: matchedDept ? matchedDept.id : 0,
        managerId: null,
      });
    } catch (err) {
      setError("Failed to load employee record.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      setError("Please fill in first name, last name, and corporate email.");
      return;
    }
    if (!formData.departmentId) {
      setError("Please select a department assignment.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      if (isEdit) {
        await employeeApi.update(Number(id), formData);
        addToast("success", "Employee profile updated.");
      } else {
        await employeeApi.create(formData);
        addToast("success", "Employee enrolled successfully.");
      }
      navigate("/employees");
    } catch (err: unknown) {
      if (isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to save employee profile.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        breadcrumbs={[
          { label: "Employees", href: "/employees" },
          { label: isEdit ? "Edit Employee" : "Enroll Employee" },
        ]}
        title={isEdit ? `Edit: ${formData.firstName} ${formData.lastName}` : "Enroll Corporate Employee"}
        description="Add staff members for equipment allocation, IT ticketing, and directory records."
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate("/employees")}>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Name *"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              placeholder="e.g. Jane"
              required
            />
            <Input
              label="Last Name *"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              placeholder="e.g. Doe"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Corporate Email Address *"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g. jdoe@company.internal"
              required
            />
            <Input
              label="Contact Phone (Optional)"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 (555) 019-2834"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Designation Role *"
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value as Designation })}
            >
              {DESIGNATIONS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </Select>

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
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" size="sm" type="button" onClick={() => navigate("/employees")}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" loading={saving} icon={<Save size={14} />}>
            {isEdit ? "Save Profile Changes" : "Enroll Employee"}
          </Button>
        </div>
      </form>
    </div>
  );
}