import { useEffect, useState } from "react";
import { AlertTriangle, Search, Eye, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const initialComplaints = [
  {
    id: "CMP-1021",
    title: "Broken classroom bench",
    department: "Maintenance",
    priority: "Medium",
    status: "Escalated",
    reason: "Resolution deadline exceeded",
    date: "12 Nov 2026",
  },
  {
    id: "CMP-1024",
    title: "Water leakage in Hostel Block A",
    department: "Plumbing",
    priority: "High",
    status: "In Progress",
    reason: "High-priority complaint requiring attention",
    date: "13 Nov 2026",
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
      // Keep sample data if saved data is invalid.
    }

    return complaint;
  });
}

export default function AdminEscalations() {
  const [complaints, setComplaints] = useState(getComplaints);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const refresh = () => setComplaints(getComplaints());

    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const escalatedComplaints = complaints.filter(
    (complaint) => complaint.status === "Escalated",
  );

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch =
      complaint.id.toLowerCase().includes(search.toLowerCase()) ||
      complaint.title.toLowerCase().includes(search.toLowerCase());

    const matchesFilter = filter === "All" || complaint.status === filter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Escalation Management
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Monitor escalated and high-priority campus complaints.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle size={20} />
            <span className="text-sm font-medium">Escalated</span>
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-800">
            {escalatedComplaints.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 text-yellow-600">
            <Clock size={20} />
            <span className="text-sm font-medium">High Priority</span>
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-800">
            {complaints.filter((c) => c.priority === "High").length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 text-blue-600">
            <AlertTriangle size={20} />
            <span className="text-sm font-medium">Under Monitoring</span>
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-800">
            {
              complaints.filter((c) =>
                ["Escalated", "In Progress"].includes(c.status),
              ).length
            }
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-800">
          Complaint Escalation Tracker
        </h2>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search complaint..."
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Escalated">Escalated</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        <div className="mt-5 space-y-4">
          {filteredComplaints.length > 0 ? (
            filteredComplaints.map((complaint) => (
              <div
                key={complaint.id}
                className="rounded-lg border border-slate-200 p-4"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs text-slate-400">
                      {complaint.id} · {complaint.date}
                    </p>

                    <h3 className="mt-1 font-semibold text-slate-800">
                      {complaint.title}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Department: {complaint.department}
                    </p>

                    <p className="mt-2 text-sm text-slate-600">
                      Reason: {complaint.reason}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                        {complaint.priority} Priority
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          complaint.status === "Escalated"
                            ? "bg-red-100 text-red-700"
                            : complaint.status === "Resolved"
                              ? "bg-green-100 text-green-700"
                              : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {complaint.status}
                      </span>
                    </div>
                  </div>

                  <Link
                    to={`/staff/tasks/${complaint.id}`}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    <Eye size={16} />
                    View Details
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p className="py-8 text-center text-sm text-slate-500">
              No matching complaints found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
