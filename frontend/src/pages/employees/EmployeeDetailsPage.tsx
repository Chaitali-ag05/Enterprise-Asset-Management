import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { isAxiosError } from "axios";
import { Edit, Laptop, AlertTriangle } from "lucide-react";
import { employeeApi } from "../../api/employeeApi";
import { assetApi } from "../../api/assetApi";
import type { EmployeeResponse } from "../../types/employee";
import type { AssetResponse } from "../../types/asset";
import { useAuthStore } from "../../context/useAuthStore";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";

export default function EmployeeDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [employee, setEmployee] = useState<EmployeeResponse | null>(null);
  const [assets, setAssets] = useState<AssetResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isAdmin = user?.role === "ROLE_ADMIN";

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      if (!id) return;
      setLoading(true);
      setError("");

      const [empData, assetData] = await Promise.all([
        employeeApi.getById(Number(id)),
        assetApi.getByEmployeeId(Number(id)).catch(() => []),
      ]);

      setEmployee(empData);
      setAssets(Array.isArray(assetData) ? assetData : (assetData as any).content || []);
    } catch (err: unknown) {
      if (isAxiosError(err) && err.response?.status === 404) {
        setError("Employee record not found.");
      } else {
        setError("Failed to load employee details.");
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

  if (error || !employee) {
    return (
      <div className="p-8 text-center bg-white dark:bg-[#111714] border border-[#E5E9E7] dark:border-[#25312B] rounded-xl max-w-lg mx-auto space-y-3 shadow-sm dark:shadow-card">
        <AlertTriangle className="w-8 h-8 text-red-500 dark:text-red-400 mx-auto" />
        <h3 className="font-heading font-semibold text-sm text-[#1A1D18] dark:text-[#F3F7F4]">{error || "Employee Not Found"}</h3>
        <Button variant="outline" size="sm" onClick={() => navigate("/employees")}>
          ← Return to Directory
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        breadcrumbs={[
          { label: "Employees", href: "/employees" },
          { label: employee.employeeCode || `EMP-${employee.id}` },
        ]}
        title={`${employee.firstName} ${employee.lastName}`}
        badge={<StatusBadge status={employee.status} size="sm" />}
        description={`Designation: ${employee.designation || "Staff"} · Department: ${employee.departmentName || "Unassigned"}`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/employees")}>
              ← Back
            </Button>
            {isAdmin && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(`/employees/${employee.id}/edit`)}
                icon={<Edit size={14} />}
              >
                Edit Profile
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Profile Card */}
        <div className="p-4 bg-white dark:bg-[#111714] border border-[#E5E9E7] dark:border-[#25312B] rounded-xl space-y-4 shadow-sm dark:shadow-card">
          <h3 className="font-heading font-semibold text-xs text-[#1A1D18] dark:text-[#F3F7F4] uppercase tracking-wider border-b border-[#E5E9E7] dark:border-[#25312B] pb-2">
            Employee Profile
          </h3>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-2xs font-mono text-[#526159] dark:text-[#87948C] uppercase">Employee Code</p>
              <p className="font-mono font-semibold text-[#2E8540] dark:text-[#A3FF5F] mt-0.5">{employee.employeeCode || `EMP-${employee.id}`}</p>
            </div>
            <div>
              <p className="text-2xs font-mono text-[#526159] dark:text-[#87948C] uppercase">Work Email</p>
              <p className="font-medium text-[#1A1D18] dark:text-[#F3F7F4] mt-0.5 truncate">{employee.email}</p>
            </div>
            <div>
              <p className="text-2xs font-mono text-[#526159] dark:text-[#87948C] uppercase">Department</p>
              <p className="font-medium text-[#1A1D18] dark:text-[#F3F7F4] mt-0.5">{employee.departmentName || "General Dept"}</p>
            </div>
            <div>
              <p className="text-2xs font-mono text-[#526159] dark:text-[#87948C] uppercase">Designation</p>
              <p className="font-medium text-[#1A1D18] dark:text-[#F3F7F4] mt-0.5">{employee.designation || "Staff"}</p>
            </div>
            <div>
              <p className="text-2xs font-mono text-[#526159] dark:text-[#87948C] uppercase">Phone</p>
              <p className="font-mono text-[#1A1D18] dark:text-[#F3F7F4] mt-0.5">{employee.phone || "—"}</p>
            </div>
            <div>
              <p className="text-2xs font-mono text-[#526159] dark:text-[#87948C] uppercase">Manager</p>
              <p className="font-medium text-[#1A1D18] dark:text-[#F3F7F4] mt-0.5">{employee.managerName || "None"}</p>
            </div>
          </div>
        </div>

        {/* Assigned Assets Card */}
        <div className="p-4 bg-white dark:bg-[#111714] border border-[#E5E9E7] dark:border-[#25312B] rounded-xl space-y-3 shadow-sm dark:shadow-card">
          <h3 className="font-heading font-semibold text-xs text-[#1A1D18] dark:text-[#F3F7F4] uppercase tracking-wider border-b border-[#E5E9E7] dark:border-[#25312B] pb-2 flex items-center justify-between">
            <span>Assigned Hardware Custody ({assets.length})</span>
            <Laptop size={14} className="text-[#526159] dark:text-[#87948C]" />
          </h3>

          {assets.length === 0 ? (
            <p className="text-xs text-[#74827A] dark:text-[#87948C] py-6 text-center">No hardware assets currently assigned.</p>
          ) : (
            <div className="divide-y divide-[#E5E9E7] dark:divide-[#25312B] max-h-56 overflow-y-auto">
              {assets.map((asset) => (
                <div key={asset.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <Link to={`/assets/${asset.id}`} className="font-semibold text-[#1A1D18] dark:text-[#F3F7F4] hover:text-[#2E8540] dark:hover:text-[#A3FF5F]">
                      {asset.assetName}
                    </Link>
                    <p className="text-2xs font-mono text-[#526159] dark:text-[#87948C]">
                      {asset.assetCode} · S/N: {asset.serialNumber}
                    </p>
                  </div>
                  <StatusBadge status={asset.status} size="xs" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}