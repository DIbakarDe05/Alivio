import { useEffect, useState } from "react";
import {
  ClipboardList,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  TrendingUp,
} from "lucide-react";

const initialComplaints = [
  {
    id: "CMP-1024",
    title: "Water leakage in Hostel Block A",
    department: "Plumbing",
    priority: "High",
    status: "In Progress",
  },
  {
    id: "CMP-1023",
    title: "Street light not working",
    department: "Electrical",
    priority: "Medium",
    status: "Pending",
  },
  {
    id: "CMP-1021",
    title: "Broken classroom bench",
    department: "Maintenance",
    priority: "Medium",
    status: "Pending",
  },
  {
    id: "CMP-1019",
    title: "Water cooler not working",
    department: "Plumbing",
    priority: "Low",
    status: "Resolved",
  },
];

function getComplaints() {
  return initialComplaints.map((complaint) => {
    try {
      const saved = localStorage.getItem(`campus_resolution_${complaint.id}`);

      if (saved) {
        const resolution = JSON.parse(saved);
        return {
          ...complaint,
          status: resolution.status || complaint.status,
        };
      }
    } catch {
      // Retain sample data if saved data is invalid.
    }

    return complaint;
  });
}

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState(getComplaints);

  useEffect(() => {
    const refresh = () => setComplaints(getComplaints());

    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const total = complaints.length;

  const pending = complaints.filter((c) =>
    ["Pending", "Assigned"].includes(c.status),
  ).length;

  const inProgress = complaints.filter((c) =>
    ["In Progress", "Awaiting Verification"].includes(c.status),
  ).length;

  const resolved = complaints.filter((c) => c.status === "Resolved").length;

  const escalated = complaints.filter((c) => c.status === "Escalated").length;

  const stats = [
    {
      title: "Total Complaints",
      value: total,
      icon: ClipboardList,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Pending",
      value: pending,
      icon: Clock,
      color: "bg-yellow-50 text-yellow-600",
    },
    {
      title: "In Progress",
      value: inProgress,
      icon: TrendingUp,
      color: "bg-purple-50 text-purple-600",
    },
    {
      title: "Resolved",
      value: resolved,
      icon: CheckCircle,
      color: "bg-green-50 text-green-600",
    },
  ];

  const statusStyles = {
    Pending: "bg-yellow-100 text-yellow-700",
    Assigned: "bg-blue-100 text-blue-700",
    "In Progress": "bg-purple-100 text-purple-700",
    "Awaiting Verification": "bg-indigo-100 text-indigo-700",
    Resolved: "bg-green-100 text-green-700",
    Escalated: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Monitor campus complaints and resolution performance.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-xl border border-slate-200 bg-white p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">{stat.title}</p>
                <div className={`rounded-lg p-2 ${stat.color}`}>
                  <Icon size={20} />
                </div>
              </div>

              <p className="mt-4 text-3xl font-bold text-slate-800">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-2">
          <h2 className="text-lg font-semibold text-slate-800">
            Recent Complaints
          </h2>

          <div className="mt-4 space-y-3">
            {complaints.map((complaint) => (
              <div
                key={complaint.id}
                className="flex flex-col gap-2 rounded-lg border border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-xs text-slate-400">{complaint.id}</p>
                  <h3 className="mt-1 font-medium text-slate-800">
                    {complaint.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {complaint.department} · {complaint.priority} Priority
                  </p>
                </div>

                <span
                  className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${
                    statusStyles[complaint.status] ||
                    "bg-slate-100 text-slate-600"
                  }`}
                >
                  {complaint.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-red-50 p-3 text-red-600">
                <AlertTriangle size={21} />
              </div>
              <div>
                <p className="text-sm text-slate-500">Escalated Complaints</p>
                <p className="text-2xl font-bold text-slate-800">{escalated}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
                <Users size={21} />
              </div>
              <div>
                <p className="text-sm text-slate-500">Staff Members</p>
                <p className="text-2xl font-bold text-slate-800">4</p>
                <p className="mt-1 text-xs text-slate-400">
                  Sample dashboard figure
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Resolution Rate</p>
            <p className="mt-2 text-3xl font-bold text-green-600">
              {total > 0 ? `${Math.round((resolved / total) * 100)}%` : "0%"}
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-green-500"
                style={{
                  width: `${total > 0 ? (resolved / total) * 100 : 0}%`,
                }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Based on sample complaints
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
