import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import RaiseComplaint from "./pages/user/RaiseComplaint";
import UserDashboard from "./pages/user/UserDashboard";
import MyComplaints from "./pages/user/MyComplaints";
import ComplaintDetails from "./pages/user/ComplaintDetails";
import Notifications from "./pages/user/Notifications";
import Profile from "./pages/user/Profile";

import StaffDashboard from "./pages/staff/StaffDashboard";
import StaffTaskDetails from "./pages/staff/StaffTaskDetails";
import StaffTasks from "./pages/staff/StaffTasks";
import StaffSLA from "./pages/staff/StaffSLA";
import StaffNotifications from "./pages/staff/StaffNotifications";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminComplaints from "./pages/admin/AdminComplaints";
import AdminStaff from "./pages/admin/AdminStaff";
import AdminEscalations from "./pages/admin/AdminEscalations";
import AdminVerifications from "./pages/admin/AdminVerifications";
import AdminAnalytics from "./pages/admin/AdminAnalytics";

import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";

// Temporary pages for features under development.
function PlaceholderPage({ title }) {
  return (
    <div className="rounded-xl bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
      <p className="mt-2 text-slate-500">
        Welcome to CampusResolve. This page is under development.
      </p>
    </div>
  );
}

// Shared layout for authenticated users.
function RoleLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <DashboardLayout user={user} onLogout={handleLogout}>
      <Outlet />
    </DashboardLayout>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Authentication */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ================= COMPLAINANT ROUTES ================= */}
      <Route element={<ProtectedRoute allowedRoles={["complainant"]} />}>
        <Route element={<RoleLayout />}>
          <Route path="/user/dashboard" element={<UserDashboard />} />

          <Route path="/user/raise-complaint" element={<RaiseComplaint />} />

          <Route path="/user/complaints" element={<MyComplaints />} />

          <Route path="/user/complaints/:id" element={<ComplaintDetails />} />

          <Route path="/user/notifications" element={<Notifications />} />

          <Route path="/user/profile" element={<Profile />} />

          <Route
            path="/user/assistant"
            element={<PlaceholderPage title="AI Assistant" />}
          />
        </Route>
      </Route>

      {/* ================= STAFF ROUTES ================= */}
      <Route element={<ProtectedRoute allowedRoles={["staff"]} />}>
        <Route element={<RoleLayout />}>
          <Route path="/staff/dashboard" element={<StaffDashboard />} />

          <Route path="/staff/tasks" element={<StaffTasks />} />

          <Route path="/staff/tasks/:id" element={<StaffTaskDetails />} />

          <Route path="/staff/sla" element={<StaffSLA />} />

          <Route path="/staff/notifications" element={<StaffNotifications />} />

          <Route path="/staff/profile" element={<Profile />} />
        </Route>
      </Route>

      {/* ================= ADMIN ROUTES ================= */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route element={<RoleLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          <Route path="/admin/complaints" element={<AdminComplaints />} />

          <Route path="/admin/staff" element={<AdminStaff />} />

          <Route path="/admin/escalations" element={<AdminEscalations />} />

          <Route path="/admin/verifications" element={<AdminVerifications />} />

          <Route path="/admin/analytics" element={<AdminAnalytics />} />

          <Route path="/admin/profile" element={<Profile />} />
        </Route>
      </Route>

      {/* Default route */}
      <Route path="*" element={<Login />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
