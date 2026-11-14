import { useEffect, useState } from "react";
import {
  BarChart3,
  ClipboardList,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";

const initialComplaints = [
  {
    id: "CMP-1024",
    department: "Plumbing",
    priority: "High",
    status: "In Progress",
  },
  {
    id: "CMP-1023",
    department: "Electrical",
    priority: "Medium",
    status: "Pending",
  },
  {
    id: "CMP-1021",
    department: "Maintenance",
    priority: "Medium",
    status: "Pending",
  },
  {
    id: "CMP-1019",
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

export default function AdminAnalytics() {
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

  const resolved = complaints.filter((c) => c.status === "Resolved").length;

  const pending = complaints.filter((c) =>
    ["Pending", "Assigned"].includes(c.status),
  ).length;

  const inProgress = complaints.filter((c) =>
    ["In Progress", "Awaiting Verification"].includes(c.status),
  ).length;

  const escalated = complaints.filter((c) => c.status === "Escalated").length;

  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  const departments = ["Plumbing", "Electrical", "Maintenance", "Sanitation"];

  const departmentData = departments.map((department) => ({
    name: department,
    count: complaints.filter((c) => c.department === department).length,
  }));

  const maxDepartmentCount = Math.max(...departmentData.map((d) => d.count), 1);

  const priorities = [
    {
      name: "High",
      count: complaints.filter((c) => c.priority === "High").length,
      style: "bg-red-500",
      text: "text-red-600",
    },
    {
      name: "Medium",
      count: complaints.filter((c) => c.priority === "Medium").length,
      style: "bg-yellow-500",
      text: "text-yellow-600",
    },
    {
      name: "Low",
      count: complaints.filter((c) => c.priority === "Low").length,
      style: "bg-green-500",
      text: "text-green-600",
    },
  ];

  const statusData = [
    { name: "Pending", count: pending, color: "bg-yellow-500" },
    { name: "In Progress", count: inProgress, color: "bg-blue-500" },
    { name: "Resolved", count: resolved, color: "bg-green-500" },
    { name: "Escalated", count: escalated, color: "bg-red-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Analytics & Reports
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Analyze complaint trends and campus resolution performance.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            title: "Total Complaints",
            value: total,
            icon: ClipboardList,
            style: "bg-blue-50 text-blue-600",
          },
          {
            title: "Resolved",
            value: resolved,
            icon: CheckCircle,
            style: "bg-green-50 text-green-600",
          },
          {
            title: "Pending",
            value: pending,
            icon: Clock,
            style: "bg-yellow-50 text-yellow-600",
          },
          {
            title: "Escalated",
            value: escalated,
            icon: AlertTriangle,
            style: "bg-red-50 text-red-600",
          },
        ].map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-xl border border-slate-200 bg-white p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">{stat.title}</p>
                <div className={`rounded-lg p-2 ${stat.style}`}>
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

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <BarChart3 size={20} className="text-blue-600" />
            <h2 className="font-semibold text-slate-800">
              Department-wise Complaints
            </h2>
          </div>

          <div className="mt-6 space-y-5">
            {departmentData.map((department) => (
              <div key={department.name}>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-slate-600">{department.name}</span>
                  <span className="font-semibold text-slate-800">
                    {department.count}
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-500"
                    style={{
                      width: `${
                        (department.count / maxDepartmentCount) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold text-slate-800">
            Priority-wise Distribution
          </h2>

          <div className="mt-6 space-y-6">
            {priorities.map((priority) => (
              <div key={priority.name}>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-slate-600">
                    {priority.name} Priority
                  </span>
                  <span className={`font-semibold ${priority.text}`}>
                    {priority.count}
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${priority.style}`}
                    style={{
                      width: `${
                        total > 0 ? (priority.count / total) * 100 : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="font-semibold text-slate-800">
          Complaint Status Breakdown
        </h2>

        <div className="mt-5 space-y-4">
          {statusData.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`h-3 w-3 rounded-full ${item.color}`} />
                <span className="text-sm text-slate-600">{item.name}</span>
              </div>

              <span className="font-semibold text-slate-800">{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="font-semibold text-slate-800">
          Overall Resolution Performance
        </h2>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-slate-500">Resolution Rate</span>
          <span className="text-2xl font-bold text-green-600">
            {resolutionRate}%
          </span>
        </div>

        <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-green-500"
            style={{ width: `${resolutionRate}%` }}
          />
        </div>

        <p className="mt-3 text-sm text-slate-500">
          {resolved} out of {total} sample complaints have been resolved.
        </p>
      </div>

      <p className="text-xs text-slate-400">
        Note: These analytics are calculated from the four sample complaints.
        Live reporting requires backend data integration.
      </p>
    </div>
  );
}
