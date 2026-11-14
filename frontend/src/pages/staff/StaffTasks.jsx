
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Eye, ClipboardList } from "lucide-react";

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

function getComplaints() {
  return initialComplaints.map((complaint) => {
    const saved = localStorage.getItem(
      `campus_resolution_${complaint.id}`
    );

    if (saved) {
      try {
        const resolution = JSON.parse(saved);

        return {
          ...complaint,
          status: resolution.status || complaint.status,
        };
      } catch {
        return complaint;
      }
    }

    return complaint;
  });
}

export default function StaffTasks() {
  const [complaints, setComplaints] = useState(getComplaints);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    const refreshComplaints = () => {
      setComplaints(getComplaints());
    };

    window.addEventListener("focus", refreshComplaints);
    window.addEventListener("storage", refreshComplaints);

    return () => {
      window.removeEventListener("focus", refreshComplaints);
      window.removeEventListener("storage", refreshComplaints);
    };
  }, []);

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch =
      complaint.id.toLowerCase().includes(search.toLowerCase()) ||
      complaint.title.toLowerCase().includes(search.toLowerCase()) ||
      complaint.category.toLowerCase().includes(search.toLowerCase()) ||
      complaint.department.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || complaint.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const priorityStyles = {
    High: "bg-red-100 text-red-700",
    Medium: "bg-yellow-100 text-yellow-700",
    Low: "bg-green-100 text-green-700",
  };

  const statusStyles = {
    Pending: "bg-yellow-100 text-yellow-700",
    Assigned: "bg-blue-100 text-blue-700",
    "In Progress": "bg-blue-100 text-blue-700",
    "Awaiting Verification": "bg-purple-100 text-purple-700",
    Resolved: "bg-green-100 text-green-700",
    Escalated: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Assigned Complaints
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          View and manage complaints assigned to your department.
        </p>
      </div>

      {/* Statistics */}
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
                ["Pending", "Assigned"].includes(c.status)
              ).length
            }
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">In Progress</p>
          <p className="mt-2 text-2xl font-bold text-blue-600">
            {
              complaints.filter((c) =>
                ["In Progress", "Awaiting Verification"].includes(c.status)
              ).length
            }
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search by ID, title, category or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Awaiting Verification">Awaiting Verification</option>
            <option value="Resolved">Resolved</option>
            <option value="Escalated">Escalated</option>
          </select>
        </div>

        {/* Complaint Cards */}
        <div className="mt-5 space-y-4">
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
                    <p className="text-xs font-medium text-slate-400">
                      {complaint.id} · {complaint.date}
                    </p>

                    <h3 className="mt-1 font-semibold text-slate-800">
                      {complaint.title}
                    </h3>

                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-slate-500">
                        Category:{" "}
                        <span className="font-medium text-slate-700">
                          {complaint.category}
                        </span>
                      </p>

                      <p className="text-sm text-slate-500">
                        Department:{" "}
                        <span className="font-medium text-slate-700">
                          {complaint.department}
                        </span>
                      </p>
                    </div>

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
            <div className="py-10 text-center text-slate-500">
              No complaints found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
