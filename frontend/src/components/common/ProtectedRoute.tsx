import { Navigate, Outlet, Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { useAuthStore } from "../../context/useAuthStore";
import { type Role } from "../../types/auth";

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-6 px-4 text-center mt-20">
        <div className="w-20 h-20 bg-danger/10 text-danger rounded-full flex items-center justify-center">
          <ShieldAlert size={40} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-500 max-w-md mx-auto">
            You don't have permission to perform this action or view this page. If you believe this is a mistake, contact your administrator.
          </p>
        </div>
        <Link
          to="/"
          className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return <Outlet />;
}

