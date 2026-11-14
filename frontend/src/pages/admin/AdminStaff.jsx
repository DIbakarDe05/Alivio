import { useState } from "react";
import { Search, Users, ClipboardList, UserCheck } from "lucide-react";

const staffMembers = [
  {
    id: 1,
    name: "Rahul Sharma",
    email: "rahul@campus.com",
    department: "Plumbing",
    assigned: 8,
    resolved: 6,
    status: "Available",
  },
  {
    id: 2,
    name: "Priya Das",
    email: "priya@campus.com",
    department: "Electrical",
    assigned: 10,
    resolved: 7,
    status: "Available",
  },
  {
    id: 3,
    name: "Amit Kumar",
    email: "amit@campus.com",
    department: "Maintenance",
    assigned: 6,
    resolved: 4,
    status: "Busy",
  },
  {
    id: 4,
    name: "Sneha Roy",
    email: "sneha@campus.com",
    department: "Sanitation",
    assigned: 9,
    resolved: 8,
    status: "Available",
  },
];

export default function AdminStaff() {
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");

  const filteredStaff = staffMembers.filter((staff) => {
    const matchesSearch =
      staff.name.toLowerCase().includes(search.toLowerCase()) ||
      staff.email.toLowerCase().includes(search.toLowerCase());

    const matchesDepartment =
      departmentFilter === "All" || staff.department === departmentFilter;

    return matchesSearch && matchesDepartment;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Staff Management</h1>
        <p className="mt-1 text-sm text-slate-500">
          Monitor staff members, departments and complaint performance.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
              <Users size={21} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Staff</p>
              <p className="text-2xl font-bold text-slate-800">
                {staffMembers.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-3 text-green-600">
              <UserCheck size={21} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Available Staff</p>
              <p className="text-2xl font-bold text-slate-800">
                {staffMembers.filter((s) => s.status === "Available").length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-3 text-purple-600">
              <ClipboardList size={21} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Assigned</p>
              <p className="text-2xl font-bold text-slate-800">
                {staffMembers.reduce((sum, s) => sum + s.assigned, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-800">
          Staff Directory
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
              placeholder="Search staff by name or email..."
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none"
          >
            <option value="All">All Departments</option>
            <option value="Plumbing">Plumbing</option>
            <option value="Electrical">Electrical</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Sanitation">Sanitation</option>
          </select>
        </div>

        <div className="mt-5 space-y-3">
          {filteredStaff.length > 0 ? (
            filteredStaff.map((staff) => (
              <div
                key={staff.id}
                className="flex flex-col gap-4 rounded-lg border border-slate-200 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                    {staff.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")}
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-800">
                      {staff.name}
                    </h3>
                    <p className="text-sm text-slate-500">{staff.email}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {staff.department} Department
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <div>
                    <p className="text-xs text-slate-400">Assigned</p>
                    <p className="font-semibold text-slate-800">
                      {staff.assigned}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">Resolved</p>
                    <p className="font-semibold text-green-600">
                      {staff.resolved}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      staff.status === "Available"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {staff.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="py-8 text-center text-sm text-slate-500">
              No staff members found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
