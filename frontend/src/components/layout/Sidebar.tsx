import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Laptop,
  ClipboardList,
  Wrench,
  Users,
  Building,
  Truck,
  BarChart3,
  Settings,
  LogOut,
  Bell,
} from "lucide-react";
import { useAuthStore } from "../../context/useAuthStore";
import { OpsPilotLogo } from "../common/OpsPilotLogo";
import { cn } from "../../utils/cn";

export const Sidebar: React.FC<{ onCloseMobile?: () => void }> = ({ onCloseMobile }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const role = user?.role || "ROLE_EMPLOYEE";
  const isAdmin = role === "ROLE_ADMIN";
  const isManager = role === "ROLE_MANAGER";
  const isTechnician = role === "ROLE_TECHNICIAN";
  const isEmployee = role === "ROLE_EMPLOYEE";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    {
      name: isEmployee ? "My Workspace" : isTechnician ? "Workbench" : "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard size={16} />,
      show: true,
    },
    {
      name: isEmployee || isTechnician ? "My Hardware" : "Assets",
      path: "/assets",
      icon: <Laptop size={16} />,
      show: true,
    },
    {
      name: "Allocations",
      path: "/assignments",
      icon: <ClipboardList size={16} />,
      show: isAdmin || isManager,
    },
    {
      name: isTechnician ? "Repair Queue" : isEmployee ? "My Issues" : "Maintenance",
      path: "/maintenance",
      icon: <Wrench size={16} />,
      show: true,
    },
    {
      name: "Employees",
      path: "/employees",
      icon: <Users size={16} />,
      show: isAdmin || isManager,
    },
    {
      name: "Departments",
      path: "/departments",
      icon: <Building size={16} />,
      show: isAdmin,
    },
    {
      name: "Vendors",
      path: "/vendors",
      icon: <Truck size={16} />,
      show: isAdmin,
    },
  ];

  const secondaryNavItems = [
    {
      name: "Reports",
      path: "/reports",
      icon: <BarChart3 size={16} />,
      show: !isEmployee,
    },
    {
      name: "Notifications",
      path: "/notifications",
      icon: <Bell size={16} />,
      show: true,
    },
    {
      name: "Settings",
      path: "/settings",
      icon: <Settings size={16} />,
      show: true,
    },
  ];

  return (
    <aside className="w-60 h-screen flex flex-col justify-between bg-white dark:bg-[#080D0B] border-r border-[#E5E9E7] dark:border-[#18221D] select-none text-[#526159] dark:text-[#8E9C94] transition-colors duration-150">
      <div className="flex flex-col h-full overflow-hidden">
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center border-b border-[#E5E9E7] dark:border-[#18221D] shrink-0">
          <OpsPilotLogo size="md" />
        </div>

        {/* Navigation List */}
        <div className="py-4 px-3 space-y-1.5 overflow-y-auto flex-1">
          {navItems.filter(item => item.show).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150",
                  isActive
                    ? "bg-[#E8F8EE] dark:bg-gradient-to-r dark:from-[#173020] dark:to-[#102017] border border-[#2E8540]/30 dark:border-[#A3FF5F]/30 text-[#1E6B30] dark:text-[#A3FF5F] font-semibold shadow-[0_0_15px_rgba(46,133,64,0.08)] dark:shadow-[0_0_15px_rgba(163,255,95,0.12)]"
                    : "text-[#526159] dark:text-[#8E9C94] hover:text-[#1A1D18] dark:hover:text-white hover:bg-[#F4F6F4] dark:hover:bg-[#111714] border border-transparent"
                )
              }
            >
              <span className="shrink-0">{item.icon}</span>
              <span className="truncate">{item.name}</span>
            </NavLink>
          ))}

          <div className="pt-3 pb-2">
            <div className="border-t border-[#E5E9E7] dark:border-[#18221D]" />
          </div>

          {secondaryNavItems.filter(item => item.show).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150",
                  isActive
                    ? "bg-[#E8F8EE] dark:bg-gradient-to-r dark:from-[#173020] dark:to-[#102017] border border-[#2E8540]/30 dark:border-[#A3FF5F]/30 text-[#1E6B30] dark:text-[#A3FF5F] font-semibold shadow-[0_0_15px_rgba(46,133,64,0.08)] dark:shadow-[0_0_15px_rgba(163,255,95,0.12)]"
                    : "text-[#526159] dark:text-[#8E9C94] hover:text-[#1A1D18] dark:hover:text-white hover:bg-[#F4F6F4] dark:hover:bg-[#111714] border border-transparent"
                )
              }
            >
              <span className="shrink-0">{item.icon}</span>
              <span className="truncate">{item.name}</span>
            </NavLink>
          ))}
        </div>

        {/* Bottom Decorative Element & Profile Footer */}
        <div className="p-3 border-t border-[#E5E9E7] dark:border-[#18221D] shrink-0 space-y-3 bg-white dark:bg-[#080D0B]">
          {/* Subtle Decorative Crystal Slabs matching reference */}
          <div className="p-3 rounded-xl bg-[#F8FAF9] dark:bg-[#0D1511] border border-[#E5E9E7] dark:border-[#18221D] relative overflow-hidden flex items-center justify-between">
            <div className="relative z-10">
              <p className="text-[11px] font-semibold text-[#1A1D18] dark:text-white">Efficient Assets.</p>
              <p className="text-[10px] text-[#526159] dark:text-[#8E9C94]">Seamless Operations.</p>
            </div>
            {/* Ambient decorative crystal glow */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2E8540]/20 to-[#0D9488]/10 dark:from-[#A3FF5F]/25 dark:to-[#55D6BE]/10 blur-sm pointer-events-none" />
          </div>

          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-[#E8F0EC] dark:bg-[#151C18] border border-[#CBD7CE] dark:border-[#233029] flex items-center justify-center font-bold text-xs text-[#1E6B30] dark:text-[#A3FF5F] shrink-0">
                {user?.username?.substring(0, 1).toUpperCase() || "A"}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-xs text-[#1A1D18] dark:text-white truncate leading-tight capitalize">
                  {user?.username || "Admin"}
                </p>
                <p className="text-[10px] font-mono text-[#74827A] dark:text-[#6C7B73] truncate">
                  {role.replace("ROLE_", "")}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-[#74827A] dark:text-[#6C7B73] hover:text-red-500 hover:bg-[#F4F6F4] dark:hover:bg-[#151C18] transition-colors"
              title="Sign Out"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};