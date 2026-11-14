import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  Bell,
  User,
  Users,
  AlertTriangle,
  BarChart3,
  CheckCircle,
  Clock,
  LogOut,
  Building2,
} from "lucide-react";

const menuItems = {
  complainant: [
    { name: "Overview", path: "/user/dashboard", icon: LayoutDashboard },
    {
      name: "Raise Complaint",
      path: "/user/raise-complaint",
      icon: PlusCircle,
    },
    { name: "My Complaints", path: "/user/complaints", icon: ClipboardList },
    { name: "Notifications", path: "/user/notifications", icon: Bell },
    { name: "AI Assistant", path: "/user/assistant", icon: Building2 },
    { name: "My Profile", path: "/user/profile", icon: User },
  ],

  staff: [
    { name: "Overview", path: "/staff/dashboard", icon: LayoutDashboard },
    { name: "Assigned Complaints", path: "/staff/tasks", icon: ClipboardList },
    { name: "SLA & Deadlines", path: "/staff/sla", icon: Clock },
    { name: "Notifications", path: "/staff/notifications", icon: Bell },
    { name: "My Profile", path: "/staff/profile", icon: User },
  ],

  admin: [
    { name: "Overview", path: "/admin/dashboard", icon: LayoutDashboard },
    {
      name: "Complaint Management",
      path: "/admin/complaints",
      icon: ClipboardList,
    },
    { name: "Staff Management", path: "/admin/staff", icon: Users },
    { name: "Escalations", path: "/admin/escalations", icon: AlertTriangle },
    {
      name: "Verification Review",
      path: "/admin/verifications",
      icon: CheckCircle,
    },
    { name: "Analytics & Reports", path: "/admin/analytics", icon: BarChart3 },
    { name: "My Profile", path: "/admin/profile", icon: User },
  ],
};

function Sidebar({ role = "complainant", onLogout }) {
  const items = menuItems[role] || menuItems.complainant;

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-slate-800 bg-slate-950 text-white">
      <div className="flex h-20 items-center gap-3 border-b border-slate-800 px-6">
        <div className="rounded-lg bg-blue-600 p-2">
          <Building2 size={23} />
        </div>
        <div>
          <h1 className="text-lg font-bold">CampusResolve</h1>
          <p className="text-xs text-slate-400">Issue Resolution Portal</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto p-4">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Main Menu
        </p>

        {items.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <Icon size={19} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 p-4">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut size={19} />
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
