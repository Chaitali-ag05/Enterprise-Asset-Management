import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastProvider } from "./context/ToastContext";
import { NotificationProvider } from "./context/NotificationContext";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import VerifyOtpPage from "./pages/auth/VerifyOtpPage";
import AppShell from "./components/layout/AppShell";
import DashboardPage from "./pages/dashboard/DashboardPage";
import AssetListPage from "./pages/assets/AssetListPage";
import AssetDetailsPage from "./pages/assets/AssetDetailsPage";
import AssetFormPage from "./pages/assets/AssetFormPage";
import DepartmentListPage from "./pages/departments/DepartmentListPage";
import DepartmentFormPage from "./pages/departments/DepartmentFormPage";
import AssignmentListPage from "./pages/assignments/AssignmentListPage";
import AssignmentDetailsPage from "./pages/assignments/AssignmentDetailsPage";
import AssignmentFormPage from "./pages/assignments/AssignmentFormPage";
import EmployeeListPage from "./pages/employees/EmployeeListPage";
import EmployeeDetailsPage from "./pages/employees/EmployeeDetailsPage";
import EmployeeFormPage from "./pages/employees/EmployeeFormPage";
import ProtectedRoute from "./components/common/ProtectedRoute";

import MaintenanceListPage from "./pages/maintenance/MaintenanceListPage";
import MaintenanceDetailsPage from "./pages/maintenance/MaintenanceDetailsPage";
import ReportIssuePage from "./pages/maintenance/ReportIssuePage";
import TechnicianWorkOrderPage from "./pages/maintenance/TechnicianWorkOrderPage";
import NotificationListPage from "./pages/notifications/NotificationListPage";
import NotFoundPage from "./pages/NotFoundPage";
import SettingsPage from "./pages/settings/SettingsPage";
import VendorListPage from "./pages/vendors/VendorListPage";
import ReportsPage from "./pages/reports/ReportsPage";

function App() {
  return (
    <ToastProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-otp" element={<VerifyOtpPage />} />
            
            {/* Protected Routes */}
            <Route element={<AppShell />}>
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                
                {/* Assets */}
                <Route path="/assets" element={<AssetListPage />} />
                <Route element={<ProtectedRoute allowedRoles={["ROLE_ADMIN", "ROLE_MANAGER"]} />}>
                  <Route path="/assets/new" element={<AssetFormPage />} />
                  <Route path="/assets/:id/edit" element={<AssetFormPage />} />
                </Route>
                <Route path="/assets/:id" element={<AssetDetailsPage />} />
                
                {/* Assignments */}
                <Route path="/assignments" element={<AssignmentListPage />} />
                <Route element={<ProtectedRoute allowedRoles={["ROLE_ADMIN", "ROLE_MANAGER"]} />}>
                  <Route path="/assignments/new" element={<AssignmentFormPage />} />
                </Route>
                <Route path="/assignments/:id" element={<AssignmentDetailsPage />} />

                {/* Departments */}
                <Route element={<ProtectedRoute allowedRoles={["ROLE_ADMIN"]} />}>
                  <Route path="/departments" element={<DepartmentListPage />} />
                  <Route path="/departments/new" element={<DepartmentFormPage />} />
                  <Route path="/departments/:id/edit" element={<DepartmentFormPage />} />
                </Route>

                {/* Employees */}
                <Route element={<ProtectedRoute allowedRoles={["ROLE_ADMIN", "ROLE_MANAGER"]} />}>
                  <Route path="/employees" element={<EmployeeListPage />} />
                  <Route path="/employees/new" element={<EmployeeFormPage />} />
                  <Route path="/employees/:id/edit" element={<EmployeeFormPage />} />
                  <Route path="/employees/:id" element={<EmployeeDetailsPage />} />
                </Route>

                {/* Notifications */}
                <Route path="/notifications" element={<NotificationListPage />} />

                {/* Maintenance */}
                <Route path="/maintenance" element={<MaintenanceListPage />} />
                <Route path="/maintenance/report" element={<ReportIssuePage />} />
                <Route element={<ProtectedRoute allowedRoles={["ROLE_ADMIN", "ROLE_TECHNICIAN"]} />}>
                  <Route path="/maintenance/technician-queue" element={<TechnicianWorkOrderPage />} />
                </Route>
                <Route path="/maintenance/:id" element={<MaintenanceDetailsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/vendors" element={<ProtectedRoute allowedRoles={["ROLE_ADMIN"]} />}><Route index element={<VendorListPage />} /></Route>
                <Route element={<ProtectedRoute allowedRoles={["ROLE_ADMIN", "ROLE_MANAGER", "ROLE_TECHNICIAN"]} />}>
                  <Route path="/reports" element={<ReportsPage />} />
                </Route>
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Route>
          </Routes>
        </Router>
      </NotificationProvider>
    </ToastProvider>
  );
}

export default App;