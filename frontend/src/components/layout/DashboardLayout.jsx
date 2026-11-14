import Sidebar from "./Sidebar";
import Header from "./Header";

function DashboardLayout({ children, user, onLogout }) {
  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Sidebar */}
      <Sidebar role={user?.role} onLogout={onLogout} />

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <Header user={user} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}

export default DashboardLayout;
