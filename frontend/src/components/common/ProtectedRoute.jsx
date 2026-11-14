import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function ProtectedRoute({ allowedRoles }) {
  const { user } = useAuth();

  // If user is not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user's role is not allowed, redirect to their dashboard
  if (!allowedRoles.includes(user.role)) {
    const roleHome = {
      complainant: "/user/dashboard",
      staff: "/staff/dashboard",
      admin: "/admin/dashboard",
    };

    return <Navigate to={roleHome[user.role] || "/login"} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
