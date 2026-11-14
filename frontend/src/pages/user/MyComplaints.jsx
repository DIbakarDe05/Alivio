import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  ClipboardList,
  CalendarDays,
  ArrowUpRight,
} from "lucide-react";

const complaintData = [
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
    id: "CMP-1022",
    title: "Garbage collection issue",
    category: "Cleanliness",
    department: "Sanitation",
    priority: "Low",
    status: "Resolved",
    date: "10 Nov 2026",
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
];

function MyComplaints() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [complaints, setComplaints] = useState(() =>
    complaintData.map((complaint) => {
      const savedData = JSON.parse(
        localStorage.getItem(`campus_resolution_${complaint.id}`) || "{}",
      );

      return {
        ...complaint,
        status: savedData.status || complaint.status,
      };
    }),
  );

  useEffect(() => {
    const syncComplaintStatuses = () => {
      setComplaints(
        complaintData.map((complaint) => {
          const savedData = JSON.parse(
            localStorage.getItem(`campus_resolution_${complaint.id}`) || "{}",
          );

          return {
            ...complaint,
            status: savedData.status || complaint.status,
          };
        }),
      );
    };

    window.addEventListener("focus", syncComplaintStatuses);
    window.addEventListener("storage", syncComplaintStatuses);

    return () => {
      window.removeEventListener("focus", syncComplaintStatuses);
      window.removeEventListener("storage", syncComplaintStatuses);
    };
  }, []);

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch =
      complaint.title.toLowerCase().includes(search.toLowerCase()) ||
      complaint.id.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || complaint.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const statusStyles = {
    Pending: "bg-amber-100 text-amber-700",
    "In Progress": "bg-blue-100 text-blue-700",
    Resolved: "bg-green-100 text-green-700",
    Escalated: "bg-red-100 text-red-700",
    "Awaiting Verification": "bg-purple-100 text-purple-700",
  };

  const priorityStyles = {
    High: "bg-red-100 text-red-700",
    Medium: "bg-amber-100 text-amber-700",
    Low: "bg-green-100 text-green-700",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Complaints</h1>
        <p className="mt-1 text-sm text-slate-500">
          Track and manage all the complaints you have submitted.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-300 px-3">
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by complaint title or ID..."
            className="w-full p-2 text-sm outline-none"
          />
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-slate-300 px-3">
          <Filter size={18} className="text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent p-2 text-sm outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Escalated">Escalated</option>
          </select>
        </div>
      </div>

      {/* Complaint Cards */}
      <div className="space-y-4">
        {filteredComplaints.length > 0 ? (
          filteredComplaints.map((complaint) => (
            <div
              key={complaint.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex flex-col justify-between gap-4 sm:flex-row">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-blue-600">
                      {complaint.id}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[complaint.status]}`}
                    >
                      {complaint.status}
                    </span>
                  </div>

                  <h2 className="text-lg font-semibold text-slate-800">
                    {complaint.title}
                  </h2>

                  <div className="flex flex-wrap gap-3 text-sm text-slate-500">
                  <span>
                    Category: <strong className="text-slate-700">{complaint.category}</strong>
                  </span>

                  <span>
                    Department: <strong className="text-slate-700">{complaint.department}</strong>
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${priorityStyles[complaint.priority]}`}
                  >
                    {complaint.priority} Priority
                  </span>
                </div>

                  <p className="text-xs text-slate-400">
                    <CalendarDays size={14} className="mr-1 inline" />
                    Submitted: {complaint.date}
                  </p>
                </div>

                <div className="flex items-center">
                  <Link
                    to={`/user/complaints/${complaint.id}`}
                    className="flex items-center gap-2 rounded-lg border border-blue-200 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
                  >
                    View Details
                    <ArrowUpRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
            <ClipboardList size={40} className="mx-auto text-slate-300" />
            <h3 className="mt-3 font-semibold text-slate-700">
              No complaints found
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Try changing your search or status filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyComplaints;
