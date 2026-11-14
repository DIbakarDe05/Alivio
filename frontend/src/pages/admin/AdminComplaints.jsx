import { useEffect, useState } from "react";
import { Search, ClipboardList, Eye } from "lucide-react";
import { Link } from "react-router-dom";

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
    id: "CMP-1021",
    title: "Broken classroom bench",
    department: "Maintenance",
    priority: "Medium",
    status: "Pending",
    date: "08 Nov 2026",
  },
  {
    id: "CMP-1019",
    title: "Water cooler not working",
    department: "Plumbing",
    priority: "Low",
    status: "Resolved",
    date: "07 Nov 2026",
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
      // Keep the sample complaint if saved data is invalid.
    }

    return complaint;
  });
}

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState(getComplaints);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  useEffect(() => {
    const refresh = () => setComplaints(getComplaints());

    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch =
      complaint.id.toLowerCase().includes(search.toLowerCase()) ||
      complaint.title.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || complaint.status === statusFilter;

    const matchesPriority =
      priorityFilter === "All" || complaint.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const statusStyles = {
    Pending: "bg-yellow-100 text-yellow-700",
    Assigned: "bg-blue-100 text-blue-700",
    "In Progress": "bg-purple-100 text-purple-700",
    "Awaiting Verification": "bg-indigo-100 text-indigo-700",
    Resolved: "bg-green-100 text-green-700",
    Escalated: "bg-red-100 text-red-700",
  };

  const priorityStyles = {
    High: "bg-red-100 text-red-700",
    Medium: "bg-yellow-100 text-yellow-700",
    Low: "bg-green-100 text-green-700",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Complaint Management
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Monitor and review all campus complaints.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Total Complaints</p>
          <p className="mt-2 text-2xl font-bold text-slate-800">
            {complaints.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Pending</p>
          <p className="mt-2 text-2xl font-bold text-yellow-600">
            {
              complaints.filter((c) =>
                ["Pending", "Assigned"].includes(c.status),
              ).length
            }
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Resolved</p>
          <p className="mt-2 text-2xl font-bold text-green-600">
            {complaints.filter((c) => c.status === "Resolved").length}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by complaint ID or title..."
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Awaiting Verification">Awaiting Verification</option>
            <option value="Resolved">Resolved</option>
            <option value="Escalated">Escalated</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none"
          >
            <option value="All">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div className="mt-5 space-y-3">
          {filteredComplaints.length > 0 ? (
            filteredComplaints.map((complaint) => (
              <div
                key={complaint.id}
                className="flex flex-col gap-4 rounded-lg border border-slate-200 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
                    <ClipboardList size={21} />
                  </div>

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

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          priorityStyles[complaint.priority]
                        }`}
                      >
                        {complaint.priority} Priority
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          statusStyles[complaint.status] ||
                          "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {complaint.status}
                      </span>
                    </div>
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
