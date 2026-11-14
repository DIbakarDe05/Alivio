import { useEffect, useState } from "react";
import {
  ClipboardCheck,
  Search,
  Image as ImageIcon,
  Clock,
} from "lucide-react";

const complaintList = [
  {
    id: "CMP-1024",
    title: "Water leakage in Hostel Block A",
    department: "Plumbing",
    staff: "Rahul Sharma",
  },
  {
    id: "CMP-1023",
    title: "Street light not working",
    department: "Electrical",
    staff: "Priya Das",
  },
  {
    id: "CMP-1021",
    title: "Broken classroom bench",
    department: "Maintenance",
    staff: "Amit Kumar",
  },
  {
    id: "CMP-1019",
    title: "Water cooler not working",
    department: "Plumbing",
    staff: "Rahul Sharma",
  },
];

function getVerificationItems() {
  return complaintList
    .map((complaint) => {
      try {
        const saved = localStorage.getItem(`campus_resolution_${complaint.id}`);

        if (!saved) return null;

        const resolution = JSON.parse(saved);

        if (resolution.status !== "Awaiting Verification") {
          return null;
        }

        return {
          ...complaint,
          ...resolution,
        };
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

export default function AdminVerifications() {
  const [items, setItems] = useState(getVerificationItems);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const refresh = () => setItems(getVerificationItems());

    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const filteredItems = items.filter(
    (item) =>
      item.id.toLowerCase().includes(search.toLowerCase()) ||
      item.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Verification Review
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Review staff-submitted evidence for complaint resolution.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-3 text-purple-600">
              <Clock size={21} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Awaiting Verification</p>
              <p className="text-2xl font-bold text-slate-800">
                {items.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-3 text-green-600">
              <ClipboardCheck size={21} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Evidence Submitted</p>
              <p className="text-2xl font-bold text-slate-800">
                {items.filter((item) => item.afterImage).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-800">
          Submitted Resolutions
        </h2>

        <div className="relative mt-4">
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

        <div className="mt-5 space-y-5">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-slate-200 p-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs text-slate-400">{item.id}</p>
                    <h3 className="mt-1 font-semibold text-slate-800">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {item.department} · Staff: {item.staff}
                    </p>
                  </div>

                  <span className="w-fit rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
                    Awaiting Verification
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <p className="mb-2 text-sm font-medium text-slate-700">
                      Before Work
                    </p>
                    {item.beforeImage ? (
                      <img
                        src={item.beforeImage}
                        alt="Before work evidence"
                        className="h-48 w-full rounded-lg border border-slate-200 object-cover"
                      />
                    ) : (
                      <div className="flex h-48 items-center justify-center rounded-lg bg-slate-50 text-sm text-slate-400">
                        <ImageIcon size={18} className="mr-2" />
                        No before image
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-medium text-slate-700">
                      After Work
                    </p>
                    {item.afterImage ? (
                      <img
                        src={item.afterImage}
                        alt="After work evidence"
                        className="h-48 w-full rounded-lg border border-slate-200 object-cover"
                      />
                    ) : (
                      <div className="flex h-48 items-center justify-center rounded-lg bg-slate-50 text-sm text-slate-400">
                        <ImageIcon size={18} className="mr-2" />
                        No after image
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 rounded-lg bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-700">
                    Staff Remarks
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {item.remarks || "No remarks provided."}
                  </p>
                </div>

                <p className="mt-3 text-xs text-slate-400">
                  Submitted:{" "}
                  {item.submittedAt
                    ? new Date(item.submittedAt).toLocaleString()
                    : "Date unavailable"}
                </p>
              </div>
            ))
          ) : (
            <div className="py-10 text-center">
              <ClipboardCheck size={35} className="mx-auto text-slate-300" />
              <p className="mt-3 font-medium text-slate-600">
                No pending verification requests
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Submitted resolutions will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
