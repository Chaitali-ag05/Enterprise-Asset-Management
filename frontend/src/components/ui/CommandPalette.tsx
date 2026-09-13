import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Laptop, Wrench, Users, Building, Truck, Sliders, Bell } from "lucide-react";
import { useAuthStore } from "../../context/useAuthStore";

export const CommandPalette: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [query, setQuery] = useState("");

  const role = user?.role || "ROLE_EMPLOYEE";
  const isAdmin = role === "ROLE_ADMIN";
  const isManager = role === "ROLE_MANAGER";
  const isTechnician = role === "ROLE_TECHNICIAN";

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const routes = [
    { label: "Dashboard", href: "/dashboard", icon: <Sliders size={14} />, show: true },
    { label: "Hardware Assets", href: "/assets", icon: <Laptop size={14} />, show: true },
    { label: "Asset Allocations", href: "/assignments", icon: <Laptop size={14} />, show: !isTechnician },
    { label: "Maintenance Operations", href: "/maintenance", icon: <Wrench size={14} />, show: true },
    { label: "Technician Workbench", href: "/maintenance/technician-queue", icon: <Wrench size={14} />, show: isTechnician || isAdmin },
    { label: "Report Hardware Issue", href: "/maintenance/report", icon: <Wrench size={14} />, show: true },
    { label: "Corporate Employees", href: "/employees", icon: <Users size={14} />, show: isAdmin || isManager },
    { label: "Departments", href: "/departments", icon: <Building size={14} />, show: isAdmin },
    { label: "Hardware Vendors", href: "/vendors", icon: <Truck size={14} />, show: isAdmin },
    { label: "Reports & Analytics", href: "/reports", icon: <Sliders size={14} />, show: isAdmin || isManager },
    { label: "Notifications", href: "/notifications", icon: <Bell size={14} />, show: true },
    { label: "Workspace Settings", href: "/settings", icon: <Sliders size={14} />, show: true },
  ];

  const filtered = routes.filter((r) => r.show && r.label.toLowerCase().includes(query.toLowerCase()));

  const handleSelect = (href: string) => {
    navigate(href);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-[#111714] border border-[#E5E9E7] dark:border-[#25312B] rounded-2xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95">
        <div className="flex items-center px-4 border-b border-[#E5E9E7] dark:border-[#25312B]">
          <Search size={16} className="text-[#74827A] shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or jump to page..."
            className="w-full h-12 px-3 text-sm bg-transparent text-[#1A1D18] dark:text-[#F3F7F4] placeholder-[#8E9C94] dark:placeholder-[#59655E] focus:outline-none"
            autoFocus
          />
          <kbd className="px-2 py-0.5 text-xs font-mono text-[#526159] dark:text-[#87948C] border border-[#E5E9E7] dark:border-[#25312B] rounded bg-[#F4F6F4] dark:bg-[#151C18]">
            ESC
          </kbd>
        </div>

        <div className="max-h-72 overflow-y-auto p-2 divide-y divide-[#E5E9E7] dark:divide-[#25312B]/40">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#74827A] dark:text-[#87948C] font-mono">No matching navigation commands</div>
          ) : (
            filtered.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelect(item.href)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 text-sm text-left rounded-xl hover:bg-[#F4F6F4] dark:hover:bg-[#151C18] text-[#526159] dark:text-[#C0CCC5] hover:text-[#1A1D18] dark:hover:text-[#F3F7F4] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[#74827A]">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </div>
                <span className="font-mono text-xs text-[#74827A] dark:text-[#87948C]">{item.href}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};