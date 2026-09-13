import React, { useState, useEffect } from "react";
import { Sun, Moon, Laptop, User, Sliders, Shield, Bell, Save, AlertCircle } from "lucide-react";
import { useAuthStore } from "../../context/useAuthStore";
import { useThemeStore, type ThemeMode } from "../../context/useThemeStore";
import { useToast } from "../../context/ToastContext";
import { employeeApi } from "../../api/employeeApi";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { cn } from "../../utils/cn";

export default function SettingsPage() {
  const { user } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  
  const [profile, setProfile] = useState<{
    id?: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    employeeCode: string;
    departmentName: string;
    designation: string;
  }>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    employeeCode: "",
    departmentName: "",
    designation: "",
  });

  const [notifMaint, setNotifMaint] = useState(true);
  const [notifAssign, setNotifAssign] = useState(true);
  const [notifSystem, setNotifSystem] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await employeeApi.getMe();
      if (data) {
        setProfile({
          id: data.id,
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          phone: data.phone || "",
          employeeCode: data.employeeCode || `EMP-${data.id}`,
          departmentName: data.departmentName || "General Operations",
          designation: data.designation || "Staff",
        });
      }
    } catch (err) {
      console.warn("Could not fetch detailed employee record, using auth fallback", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");
      await employeeApi.updateMe({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
      });
      addToast("success", "Profile preferences updated.");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const themes: { id: ThemeMode; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: "light", label: "Enterprise Light", icon: <Sun size={16} />, desc: "Crisp white surfaces, slate backgrounds, high readability" },
    { id: "dark", label: "Enterprise Dark", icon: <Moon size={16} />, desc: "Restrained dark palette for low-light operations" },
    { id: "system", label: "System Sync", icon: <Laptop size={16} />, desc: "Automatically match operating system preferences" },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Workspace Settings"
        description="Operator identity, appearance and environment preferences."
      />

      {error && (
        <div className="p-3.5 bg-red-50 dark:bg-red-500/15 border border-red-200 dark:border-red-500/40 rounded-xl flex items-center gap-2.5 text-xs text-red-600 dark:text-red-400">
          <AlertCircle size={16} className="shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* 1. Operator Profile & Identity */}
      <div className="p-6 bg-white dark:bg-[#111714] border border-[#E5E9E7] dark:border-[#25312B] rounded-2xl space-y-5 shadow-sm dark:shadow-card">
        <div className="flex items-center gap-2.5 border-b border-[#E5E9E7] dark:border-[#25312B] pb-3">
          <User size={16} className="text-[#2E8540] dark:text-[#A3FF5F]" />
          <h3 className="font-heading font-semibold text-sm text-[#1A1D18] dark:text-[#F3F7F4] uppercase tracking-wider">
            Operator Profile & Identity
          </h3>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={profile.firstName}
              onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
              placeholder="e.g. Jane"
            />
            <Input
              label="Last Name"
              value={profile.lastName}
              onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
              placeholder="e.g. Doe"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Corporate Email (Read-only)"
              value={profile.email || user?.username || ""}
              disabled
              readOnly
            />
            <Input
              label="Phone Number"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              placeholder="+1 (555) 019-2834"
            />
          </div>

          {/* Read-Only Organizational Metadata */}
          <div className="p-4 bg-[#F8FAF9] dark:bg-[#151C18] rounded-xl border border-[#E5E9E7] dark:border-[#25312B] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <p className="text-xs font-mono text-[#526159] dark:text-[#87948C] uppercase">Employee Code</p>
              <p className="font-mono font-semibold text-sm text-[#1A1D18] dark:text-[#F3F7F4] mt-1">
                {profile.employeeCode || "EMP-001"}
              </p>
            </div>
            <div>
              <p className="text-xs font-mono text-[#526159] dark:text-[#87948C] uppercase">Department</p>
              <p className="font-medium text-sm text-[#1A1D18] dark:text-[#F3F7F4] mt-1 truncate">
                {profile.departmentName || "Engineering"}
              </p>
            </div>
            <div>
              <p className="text-xs font-mono text-[#526159] dark:text-[#87948C] uppercase">Designation</p>
              <p className="font-medium text-sm text-[#1A1D18] dark:text-[#F3F7F4] mt-1 truncate">
                {profile.designation || "Staff"}
              </p>
            </div>
            <div>
              <p className="text-xs font-mono text-[#526159] dark:text-[#87948C] uppercase">System Role</p>
              <div className="mt-1">
                <StatusBadge status={user?.role?.replace("ROLE_", "") || "EMPLOYEE"} size="sm" />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <Button variant="primary" size="md" type="submit" loading={saving} icon={<Save size={15} />}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>

      {/* 2. Appearance Theme Selector */}
      <div className="p-6 bg-white dark:bg-[#111714] border border-[#E5E9E7] dark:border-[#25312B] rounded-2xl space-y-5 shadow-sm dark:shadow-card">
        <div className="flex items-center gap-2.5 border-b border-[#E5E9E7] dark:border-[#25312B] pb-3">
          <Sliders size={16} className="text-[#2E8540] dark:text-[#A3FF5F]" />
          <h3 className="font-heading font-semibold text-sm text-[#1A1D18] dark:text-[#F3F7F4] uppercase tracking-wider">
            Appearance & Interface Mode
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {themes.map((t) => {
            const isSelected = theme === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTheme(t.id)}
                className={cn(
                  "p-4 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between gap-3 select-none",
                  isSelected
                    ? "border-[#2E8540] dark:border-[#A3FF5F] bg-[#E8F8EE] dark:bg-[#A3FF5F]/5 ring-1 ring-[#2E8540] dark:ring-[#A3FF5F]"
                    : "border-[#E5E9E7] dark:border-[#25312B] bg-[#F8FAF9] dark:bg-[#151C18] hover:border-[#CBD5E1] dark:hover:border-[#2B3831] hover:bg-[#F0F4F1] dark:hover:bg-[#19221D]"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className={cn("p-2 rounded-lg", isSelected ? "bg-[#2E8540] text-white dark:bg-[#A3FF5F] dark:text-[#080D0B]" : "bg-white dark:bg-[#111714] text-[#526159] dark:text-[#87948C] border border-[#E5E9E7] dark:border-[#25312B]")}>
                    {t.icon}
                  </div>
                  {isSelected && (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2E8540] dark:bg-[#A3FF5F] shadow-sm dark:shadow-lime-glow" />
                  )}
                </div>

                <div>
                  <p className="font-semibold text-sm text-[#1A1D18] dark:text-[#F3F7F4]">
                    {t.label}
                  </p>
                  <p className="text-xs text-[#526159] dark:text-[#87948C] mt-1 leading-relaxed">
                    {t.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Notification Dispatch Preferences */}
      <div className="p-6 bg-white dark:bg-[#111714] border border-[#E5E9E7] dark:border-[#25312B] rounded-2xl space-y-5 shadow-sm dark:shadow-card">
        <div className="flex items-center gap-2.5 border-b border-[#E5E9E7] dark:border-[#25312B] pb-3">
          <Bell size={16} className="text-[#2E8540] dark:text-[#A3FF5F]" />
          <h3 className="font-heading font-semibold text-sm text-[#1A1D18] dark:text-[#F3F7F4] uppercase tracking-wider">
            Operational Notification Channels
          </h3>
        </div>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3.5 rounded-xl border border-[#E5E9E7] dark:border-[#25312B] bg-[#F8FAF9] dark:bg-[#151C18] hover:bg-[#F0F4F1] dark:hover:bg-[#19221D] transition-colors cursor-pointer">
            <div>
              <p className="font-medium text-sm text-[#1A1D18] dark:text-[#F3F7F4]">Maintenance & Ticket Updates</p>
              <p className="text-xs text-[#526159] dark:text-[#87948C] mt-0.5">Receive alerts when hardware diagnostic status changes.</p>
            </div>
            <input
              type="checkbox"
              checked={notifMaint}
              onChange={(e) => setNotifMaint(e.target.checked)}
              className="w-4 h-4 rounded bg-white dark:bg-[#111714] border-[#E5E9E7] dark:border-[#25312B] text-[#2E8540] dark:text-[#A3FF5F] focus:ring-[#2E8540] dark:focus:ring-[#A3FF5F]"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-xl border border-[#E5E9E7] dark:border-[#25312B] bg-[#F8FAF9] dark:bg-[#151C18] hover:bg-[#F0F4F1] dark:hover:bg-[#19221D] transition-colors cursor-pointer">
            <div>
              <p className="font-medium text-sm text-[#1A1D18] dark:text-[#F3F7F4]">Hardware Custody Allocations</p>
              <p className="text-xs text-[#526159] dark:text-[#87948C] mt-0.5">Notifications for new checkouts, transfers, and asset returns.</p>
            </div>
            <input
              type="checkbox"
              checked={notifAssign}
              onChange={(e) => setNotifAssign(e.target.checked)}
              className="w-4 h-4 rounded bg-white dark:bg-[#111714] border-[#E5E9E7] dark:border-[#25312B] text-[#2E8540] dark:text-[#A3FF5F] focus:ring-[#2E8540] dark:focus:ring-[#A3FF5F]"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-xl border border-[#E5E9E7] dark:border-[#25312B] bg-[#F8FAF9] dark:bg-[#151C18] hover:bg-[#F0F4F1] dark:hover:bg-[#19221D] transition-colors cursor-pointer">
            <div>
              <p className="font-medium text-sm text-[#1A1D18] dark:text-[#F3F7F4]">Security & Session Telemetry</p>
              <p className="text-xs text-[#526159] dark:text-[#87948C] mt-0.5">Alerts on new logins, role permission updates, and OTP tokens.</p>
            </div>
            <input
              type="checkbox"
              checked={notifSystem}
              onChange={(e) => setNotifSystem(e.target.checked)}
              className="w-4 h-4 rounded bg-white dark:bg-[#111714] border-[#E5E9E7] dark:border-[#25312B] text-[#2E8540] dark:text-[#A3FF5F] focus:ring-[#2E8540] dark:focus:ring-[#A3FF5F]"
            />
          </label>
        </div>
      </div>

      {/* 4. Session Security */}
      <div className="p-5 bg-white dark:bg-[#111714] border border-[#E5E9E7] dark:border-[#25312B] rounded-xl space-y-4 shadow-sm dark:shadow-card">
        <div className="flex items-center gap-2 border-b border-[#E5E9E7] dark:border-[#25312B] pb-2.5">
          <Shield size={16} className="text-[#2E8540] dark:text-[#A3FF5F]" />
          <h3 className="font-heading font-semibold text-xs text-[#1A1D18] dark:text-[#F3F7F4] uppercase tracking-wider">
            Session Security & Token Metadata
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <p className="text-2xs font-mono text-[#526159] dark:text-[#87948C] uppercase">Authentication Mode</p>
            <p className="font-medium text-[#1A1D18] dark:text-[#F3F7F4] mt-0.5">JWT Bearer Authorization</p>
          </div>
          <div>
            <p className="text-2xs font-mono text-[#526159] dark:text-[#87948C] uppercase">Token Security Status</p>
            <p className="font-medium text-[#2E8540] dark:text-[#A3FF5F] mt-0.5">Active & Encrypted</p>
          </div>
        </div>
      </div>
    </div>
  );
}