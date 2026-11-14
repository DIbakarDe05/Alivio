import { useMemo, useState } from "react";
import { Clock, AlertTriangle, CheckCircle, Search } from "lucide-react";

const slaData = [
  {
    id: "CMP-1024",
    title: "Water leakage in Hostel Block A",
    priority: "High",
    deadline: "13 Nov 2026, 11:59 PM",
    remaining: "2 hours",
    status: "In Progress",
    risk: "At Risk",
  },
  {
    id: "CMP-1023",
    title: "Street light not working",
    priority: "Medium",
    deadline: "14 Nov 2026, 05:00 PM",
    remaining: "1 day",
    status: "Pending",
    risk: "On Track",
  },
  {
    id: "CMP-1021",
    title: "Broken classroom bench",
    priority: "Medium",
    deadline: "12 Nov 2026, 05:00 PM",
    remaining: "Overdue",
    status: "Pending",
    risk: "Overdue",
  },
  {
    id: "CMP-1019",
    title: "Water cooler not working",
    priority: "Low",
    deadline: "15 Nov 2026, 05:00 PM",
    remaining: "2 days",
    status: "Resolved",
    risk: "Completed",
  },
];

export default function StaffSLA() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const complaints = useMemo(() => {
    return slaData.map((item) => {
      try {
        const saved = localStorage.getItem(`campus_resolution_${item.id}`);

        if (saved) {
          const resolution = JSON.parse(saved);
          const status = resolution.status || item.status;

          return {
            ...item,
            status,
            risk: status === "Resolved" ? "Completed" : item.risk,
          };
        }
      } catch {
        // Keep the sample data if saved data is invalid.
      }

      return item;
    });
  }, []);

  const filteredComplaints = complaints.filter((item) => {
    const matchesSearch =
      item.id.toLowerCase().includes(search.toLowerCase()) ||
      item.title.toLowerCase().includes(search.toLowerCase());

    const matchesFilter = filter === "All" || item.risk === filter;

    return matchesSearch && matchesFilter;
  });

  const overdueCount = complaints.filter(
    (item) => item.risk === "Overdue",
  ).length;

  const atRiskCount = complaints.filter(
    (item) => item.risk === "At Risk",
  ).length;

  const completedCount = complaints.filter(
    (item) => item.risk === "Completed",
  ).length;

  const riskStyles = {
    "On Track": "bg-green-100 text-green-700",
    "At Risk": "bg-yellow-100 text-yellow-700",
    Overdue: "bg-red-100 text-red-700",
    Completed: "bg-blue-100 text-blue-700",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">SLA & Deadlines</h1>
        <p className="mt-1 text-sm text-slate-500">
          Monitor complaint resolution deadlines and identify delays.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle size={19} />
            <span className="text-sm font-medium">Overdue</span>
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-800">
            {overdueCount}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 text-yellow-600">
            <Clock size={19} />
            <span className="text-sm font-medium">At Risk</span>
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-800">
            {atRiskCount}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle size={19} />
            <span className="text-sm font-medium">Completed</span>
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-800">
            {completedCount}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-800">
          Complaint Deadline Tracker
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
            <option value="All">All Deadlines</option>
            <option value="On Track">On Track</option>
            <option value="At Risk">At Risk</option>
            <option value="Overdue">Overdue</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div className="mt-5 space-y-3">
          {filteredComplaints.length > 0 ? (
            filteredComplaints.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-slate-200 p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs text-slate-400">{item.id}</p>
                    <h3 className="mt-1 font-semibold text-slate-800">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-500">
                      Deadline: {item.deadline}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Time remaining:{" "}
                      {item.status === "Resolved"
                        ? "Completed"
                        : item.remaining}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        riskStyles[item.risk]
                      }`}
                    >
                      {item.status === "Resolved" ? "Completed" : item.risk}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                      {item.priority} Priority
                    </span>
                  </div>
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
