import { Link } from "react-router-dom";
import { ClipboardList, PenTool, Bell, Users, Package } from "lucide-react";
import { useAuthStore } from "../../context/useAuthStore";

export default function QuickActions() {
  const { user } = useAuthStore();
  const role = user?.role || "ROLE_EMPLOYEE";

  const getActions = () => {
    switch (role) {
      case "ROLE_ADMIN":
      case "ROLE_MANAGER":
        return [
          { name: "Add Asset", path: "/assets/new", icon: Package, color: "text-indigo-600", bg: "bg-indigo-50" },
          { name: "Add Employee", path: "/employees/new", icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" },
          { name: "Create Assignment", path: "/assignments/new", icon: ClipboardList, color: "text-amber-600", bg: "bg-amber-50" },
          { name: "Notifications", path: "/notifications", icon: Bell, color: "text-slate-600", bg: "bg-slate-50" },
        ];
      case "ROLE_TECHNICIAN":
        return [
          { name: "My Work Orders", path: "/maintenance/technician-queue", icon: PenTool, color: "text-rose-600", bg: "bg-rose-50" },
          { name: "Maintenance Queue", path: "/maintenance", icon: ClipboardList, color: "text-amber-600", bg: "bg-amber-50" },
          { name: "View Assets", path: "/assets", icon: Package, color: "text-indigo-600", bg: "bg-indigo-50" },
          { name: "Notifications", path: "/notifications", icon: Bell, color: "text-slate-600", bg: "bg-slate-50" },
        ];
      case "ROLE_EMPLOYEE":
      default:
        return [
          { name: "Report Issue", path: "/maintenance/report", icon: PenTool, color: "text-rose-600", bg: "bg-rose-50" },
          { name: "My Assignments", path: "/assignments", icon: ClipboardList, color: "text-amber-600", bg: "bg-amber-50" },
          { name: "View Assets", path: "/assets", icon: Package, color: "text-indigo-600", bg: "bg-indigo-50" },
          { name: "Notifications", path: "/notifications", icon: Bell, color: "text-slate-600", bg: "bg-slate-50" },
        ];
    }
  };

  const actions = getActions();

  return (
    <div className="bg-[#111714] p-5 rounded-xl border border-[#25312B] shadow-card">
      <h3 className="font-heading text-sm font-semibold text-[#F3F7F4] mb-3 uppercase tracking-wider">Quick Actions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {actions.map((action, i) => (
          <Link
            key={i}
            to={action.path}
            className="flex items-center gap-3 p-3 rounded-lg border border-[#25312B] bg-[#151C18] hover:border-[#A3FF5F]/40 hover:bg-[#19221D] transition-all group"
          >
            <div className="p-2 rounded-md bg-[#111714] border border-[#25312B] group-hover:border-[#A3FF5F]/30 transition-colors">
              <action.icon size={18} className="text-[#A3FF5F]" />
            </div>
            <span className="font-medium text-xs text-[#C0CCC5] group-hover:text-[#F3F7F4] transition-colors">
              {action.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}