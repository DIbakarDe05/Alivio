import { useEffect, useState } from "react";
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  CalendarDays,
} from "lucide-react";

import { Link } from "react-router-dom";

const initialComplaints = [
  {
    id: "CMP-1024",
    title: "Water leakage in Hostel Block A",
    category: "Water & Sanitation",
    department: "Plumbing",
    priority: "High",
    status: "In Progress",
    date: "13 Nov 2026",
  },
  {
    id: "CMP-1023",
    title: "Street light not working",
    category: "Electrical & Equipment",
    department: "Electrical",
    priority: "Medium",
    status: "Pending",
    date: "12 Nov 2026",
  },
  {
    id: "CMP-1021",
    title: "Broken classroom bench",
    category: "Infrastructure",
    department: "Maintenance",
    priority: "Medium",
    status: "Escalated",
    date: "08 Nov 2026",
  },
  {
    id: "CMP-1019",
    title: "Water cooler not working",
    category: "Water & Sanitation",
    department: "Plumbing",
    priority: "Low",
    status: "Resolved",
    date: "07 Nov 2026",
  },
];
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

function StaffDashboard() {
  const [assignedComplaints, setAssignedComplaints] =
    useState(getUpdatedComplaints);

  useEffect(() => {
    const syncComplaints = () => {
      setAssignedComplaints(getUpdatedComplaints());
    };

    syncComplaints();

    window.addEventListener("focus", syncComplaints);
    window.addEventListener("storage", syncComplaints);

    return () => {
      window.removeEventListener("focus", syncComplaints);
      window.removeEventListener("storage", syncComplaints);
    };
  }, []);

  const pendingCount = assignedComplaints.filter(
    (complaint) =>
      complaint.status === "Pending" || complaint.status === "Assigned",
  ).length;

  const inProgressCount = assignedComplaints.filter(
    (complaint) =>
      complaint.status === "In Progress" ||
      complaint.status === "Awaiting Verification",
  ).length;

  const resolvedCount = assignedComplaints.filter(
    (complaint) => complaint.status === "Resolved",
  ).length;

  const highPriorityCount = assignedComplaints.filter(
    (complaint) =>
      complaint.priority === "High" && complaint.status !== "Resolved",
  ).length;

  const staffStats = [
    {
      title: "Assigned Complaints",
      value: assignedComplaints.length,
      icon: ClipboardList,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Pending",
      value: pendingCount,
      icon: Clock,
      color: "bg-amber-100 text-amber-600",
    },
    {
      title: "In Progress",
      value: inProgressCount,
      icon: AlertTriangle,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Resolved",
      value: resolvedCount,
      icon: CheckCircle2,
      color: "bg-green-100 text-green-600",
    },
  ];

  const priorityStyles = {
    High: "bg-red-100 text-red-700",
    Medium: "bg-amber-100 text-amber-700",
    Low: "bg-green-100 text-green-700",
  };

  const statusStyles = {
    Pending: "bg-amber-100 text-amber-700",
    Assigned: "bg-amber-100 text-amber-700",
    "In Progress": "bg-blue-100 text-blue-700",
    "Awaiting Verification": "bg-purple-100 text-purple-700",
    Resolved: "bg-green-100 text-green-700",
  };

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Staff Dashboard</h1>

        <p className="mt-1 text-sm text-slate-500">
          Monitor your assigned complaints and track resolution progress.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {staffStats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{stat.title}</p>

                  <h2 className="mt-2 text-3xl font-bold text-slate-800">
                    {stat.value}
                  </h2>
                </div>

                <div className={`rounded-xl p-3 ${stat.color}`}>
                  <Icon size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Priority Reminder */}
      <div className="flex flex-col justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-red-100 p-3 text-red-600">
            <AlertTriangle size={22} />
          </div>

          <div>
            <h3 className="font-semibold text-red-800">
              High Priority Attention Required
            </h3>

            <p className="mt-1 text-sm text-red-700">
              Review high-priority complaints before handling lower-priority
              tasks.
            </p>
          </div>
        </div>

        <span className="rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-700">
          {highPriorityCount} High Priority
        </span>
      </div>

      {/* Assigned Complaints */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Recent Assigned Complaints
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Complaints assigned to your department.
            </p>
          </div>

          <span className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600">
            {assignedComplaints.length} Sample Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-4">Complaint</th>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4">Department</th>
                <th className="px-5 py-4">Priority</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {assignedComplaints.map((complaint) => (
                <tr key={complaint.id} className="transition hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-blue-600">
                      {complaint.id}
                    </p>

                    <p className="mt-1 text-slate-700">{complaint.title}</p>
                  </td>

                  <td className="px-5 py-4">
                    <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700">
                      {complaint.category}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {complaint.department}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${priorityStyles[complaint.priority]}`}
                    >
                      {complaint.priority}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[complaint.status] || "bg-slate-100 text-slate-700"}`}
                    >
                      {complaint.status}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                    <CalendarDays size={14} className="mr-1 inline" />
                    {complaint.date}
                  </td>

                  <td className="px-5 py-4">
                    <Link
                      to={`/staff/tasks/${complaint.id}`}
                      className="flex items-center gap-1 font-medium text-blue-600 hover:text-blue-800"
                    >
                      View
                      <ArrowUpRight size={15} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resolution Workflow */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="font-semibold text-slate-800">
          Staff Resolution Workflow
        </h2>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-blue-50 p-4">
            <ClipboardList className="text-blue-600" size={22} />

            <h3 className="mt-2 font-semibold text-slate-800">1. Review</h3>

            <p className="mt-1 text-sm text-slate-600">
              Review complaint details and location.
            </p>
          </div>

          <div className="rounded-lg bg-amber-50 p-4">
            <Clock className="text-amber-600" size={22} />

            <h3 className="mt-2 font-semibold text-slate-800">2. Resolve</h3>

            <p className="mt-1 text-sm text-slate-600">
              Update progress and complete the assigned work.
            </p>
          </div>

          <div className="rounded-lg bg-green-50 p-4">
            <CheckCircle2 className="text-green-600" size={22} />

            <h3 className="mt-2 font-semibold text-slate-800">
              3. Submit Evidence
            </h3>

            <p className="mt-1 text-sm text-slate-600">
              Upload resolution evidence for verification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StaffDashboard;
