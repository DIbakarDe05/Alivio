import { useEffect, useState } from "react";

import {
  ClipboardList,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  ArrowUpRight,
  MapPin,
  CalendarDays,
} from "lucide-react";

import { Link } from "react-router-dom";

// Initial sample complaint records
const initialComplaints = [
  {
    id: "CMP-1024",
    title: "Water leakage in Hostel Block A",
    department: "Plumbing",
    priority: "High",
    status: "In Progress",
    date: "13 Nov 2026",
  },
  {
    id: "CMP-1023",
    title: "Street light not working",
    department: "Electrical",
    priority: "Medium",
    status: "Pending",
    date: "12 Nov 2026",
  },
  {
    id: "CMP-1022",
    title: "Garbage collection issue",
    department: "Sanitation",
    priority: "Low",
    status: "Resolved",
    date: "10 Nov 2026",
  },
];

// Read the latest complaint statuses from localStorage
function getUpdatedComplaints() {
  return initialComplaints.map((complaint) => {
    try {
      const savedData = JSON.parse(
        localStorage.getItem(`campus_resolution_${complaint.id}`) || "{}",
      );

      return {
        ...complaint,
        status: savedData.status || complaint.status,
      };
    } catch {
      return complaint;
    }
  });
}

function UserDashboard() {
  // Dynamic complaint state
  const [complaints, setComplaints] = useState(getUpdatedComplaints);

  // Synchronize complaint statuses
  useEffect(() => {
    const syncComplaints = () => {
      setComplaints(getUpdatedComplaints());
    };

    syncComplaints();

    window.addEventListener("focus", syncComplaints);
    window.addEventListener("storage", syncComplaints);

    return () => {
      window.removeEventListener("focus", syncComplaints);
      window.removeEventListener("storage", syncComplaints);
    };
  }, []);

  // Calculate dashboard statistics
  const totalComplaints = complaints.length;

  const pendingCount = complaints.filter(
    (c) => c.status === "Pending" || c.status === "Assigned",
  ).length;

  const resolvedCount = complaints.filter(
    (c) => c.status === "Resolved",
  ).length;

  const escalatedCount = complaints.filter(
    (c) => c.status === "Escalated",
  ).length;

  const stats = [
    {
      title: "Total Complaints",
      value: totalComplaints,
      icon: ClipboardList,
      color: "blue",
      description: "All complaints submitted",
    },
    {
      title: "Pending",
      value: pendingCount,
      icon: Clock,
      color: "amber",
      description: "Awaiting resolution",
    },
    {
      title: "Resolved",
      value: resolvedCount,
      icon: CheckCircle,
      color: "green",
      description: "Successfully resolved",
    },
    {
      title: "Escalated",
      value: escalatedCount,
      icon: AlertTriangle,
      color: "red",
      description: "Requires attention",
    },
  ];

  // Priority badge styling
  const getPriorityStyle = (priority) => {
    const styles = {
      High: "bg-red-100 text-red-700",
      Medium: "bg-amber-100 text-amber-700",
      Low: "bg-green-100 text-green-700",
    };

    return styles[priority] || "bg-slate-100 text-slate-700";
  };

  // Status badge styling
  const getStatusStyle = (status) => {
    const styles = {
      "In Progress": "bg-blue-100 text-blue-700",
      Pending: "bg-amber-100 text-amber-700",
      Assigned: "bg-amber-100 text-amber-700",
      "Awaiting Verification": "bg-purple-100 text-purple-700",
      Resolved: "bg-green-100 text-green-700",
      Escalated: "bg-red-100 text-red-700",
    };

    return styles[status] || "bg-slate-100 text-slate-700";
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Dashboard Overview
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Track your complaints and monitor their resolution.
          </p>
        </div>

        <Link
          to="/user/raise-complaint"
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus size={18} />
          Raise New Complaint
        </Link>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          const iconColors = {
            blue: "bg-blue-100 text-blue-600",
            amber: "bg-amber-100 text-amber-600",
            green: "bg-green-100 text-green-600",
            red: "bg-red-100 text-red-600",
          };

          return (
            <div
              key={stat.title}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className={`rounded-lg p-3 ${iconColors[stat.color]}`}>
                  <Icon size={22} />
                </div>

                <ArrowUpRight size={18} className="text-slate-400" />
              </div>

              <h2 className="mt-5 text-3xl font-bold text-slate-800">
                {stat.value}
              </h2>

              <p className="mt-1 font-medium text-slate-700">{stat.title}</p>

              <p className="mt-1 text-xs text-slate-400">{stat.description}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Complaints */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <div>
            <h2 className="font-semibold text-slate-800">Recent Complaints</h2>

            <p className="mt-1 text-sm text-slate-500">
              Your recently submitted complaints
            </p>
          </div>

          <Link
            to="/user/complaints"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            View All
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-4">Complaint</th>
                <th className="px-5 py-4">Department</th>
                <th className="px-5 py-4">Priority</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Date</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {complaints.map((complaint) => (
                <tr key={complaint.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-800">
                      {complaint.title}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {complaint.id}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {complaint.department}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${getPriorityStyle(complaint.priority)}`}
                    >
                      {complaint.priority}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(complaint.status)}`}
                    >
                      {complaint.status}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                    <CalendarDays size={14} className="mr-1 inline" />
                    {complaint.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Information */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-3 text-blue-600">
              <MapPin size={22} />
            </div>

            <h3 className="font-semibold text-slate-800">
              Location-Based Reporting
            </h3>
          </div>

          <p className="mt-3 text-sm text-slate-600">
            Report campus issues with your device location to help the concerned
            department identify the problem.
          </p>
        </div>

        <div className="rounded-xl border border-purple-100 bg-purple-50 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-3 text-purple-600">
              <CheckCircle size={22} />
            </div>

            <h3 className="font-semibold text-slate-800">
              Verified Resolution
            </h3>
          </div>

          <p className="mt-3 text-sm text-slate-600">
            Review resolution evidence and confirm whether your reported issue
            has actually been fixed.
          </p>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
