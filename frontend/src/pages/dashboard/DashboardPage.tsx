import { useAuthStore } from "../../context/useAuthStore";
import AdminDashboard from "../../components/dashboard/AdminDashboard";
import ManagerDashboard from "../../components/dashboard/ManagerDashboard";
import EmployeeDashboard from "../../components/dashboard/EmployeeDashboard";
import TechnicianDashboard from "../../components/dashboard/TechnicianDashboard";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const role = user?.role || "ROLE_EMPLOYEE";

  const getHeader = () => {
    switch (role) {
      case "ROLE_ADMIN":
        return {
          title: "Executive Overview",
          subtitle: "Enterprise-wide asset governance, departments, vendors, and operations metrics."
        };
      case "ROLE_MANAGER":
        return {
          title: "Operations & Team Portal",
          subtitle: "Manage active asset deployments, review maintenance decisions, and assign technicians."
        };
      case "ROLE_TECHNICIAN":
        return {
          title: "Technician Workspace",
          subtitle: "Manage your assigned hardware work orders and maintenance diagnostic queue."
        };
      case "ROLE_EMPLOYEE":
      default:
        return {
          title: "Employee Workspace",
          subtitle: "View your assigned company assets and track reported maintenance requests."
        };
    }
  };

  const { title, subtitle } = getHeader();

  const renderDashboard = () => {
    switch (role) {
      case "ROLE_ADMIN":
        return <AdminDashboard />;
      case "ROLE_MANAGER":
        return <ManagerDashboard />;
      case "ROLE_TECHNICIAN":
        return <TechnicianDashboard />;
      case "ROLE_EMPLOYEE":
      default:
        return <EmployeeDashboard />;
    }
  };

  return (
    <div className="w-full">
      {renderDashboard()}
    </div>
  );
}