import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  CalendarDays,
  CheckCircle,
  Clock,
  AlertTriangle,
  Image as ImageIcon,
  ShieldCheck,
  Send,
  XCircle,
} from "lucide-react";

function ComplaintDetails() {
  const { id } = useParams();

  const [resolution, setResolution] = useState(null);
  const [decision, setDecision] = useState("pending");
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [message, setMessage] = useState("");

  // Complaint data based on complaint ID
  const complaintRecords = {
    "CMP-1024": {
    title: "Water leakage in Hostel Block A",
    description:
      "There is continuous water leakage from a damaged pipe near the common washroom in Hostel Block A. Water is accumulating on the floor and causing inconvenience to students.",
    category: "Water & Sanitation",
    department: "Plumbing",
    priority: "High",
    status: "In Progress",
    date: "13 November 2026",
    latitude: "23.84 (sample)",
    longitude: "91.28 (sample)",
  },

    "CMP-1023": {
    title: "Street light not working",
    description:
      "The street light is not functioning properly, causing visibility problems and inconvenience at night.",
    category: "Electrical & Equipment",
    department: "Electrical",
    priority: "Medium",
    status: "Pending",
    date: "12 November 2026",
    latitude: "23.84 (sample)",
    longitude: "91.28 (sample)",
  },

    "CMP-1022": {
  title: "Garbage collection issue",
  description:
    "Garbage collection is not being carried out regularly in the reported area.",
  category: "Cleanliness",
  department: "Sanitation",
  priority: "Low",
  status: "Resolved",
  date: "09 November 2026",
  latitude: "23.84 (sample)",
  longitude: "91.28 (sample)",
},

    "CMP-1021": {
  title: "Broken classroom bench",
  description: "A classroom bench requires maintenance and repair.",
  category: "Infrastructure",
  department: "Maintenance",
  priority: "Medium",
  status: "Escalated",
  date: "08 November 2026",
  latitude: "23.84 (sample)",
  longitude: "91.28 (sample)",
},
  };

  const complaint = {
    id: id || "CMP-1024",
    ...(complaintRecords[id] || complaintRecords["CMP-1024"]),
  };
  // Read resolution information submitted by staff
  useEffect(() => {
    const savedResolution = localStorage.getItem(`campus_resolution_${id}`);

    if (savedResolution) {
      const parsedResolution = JSON.parse(savedResolution);
      setResolution(parsedResolution);

      setDecision(parsedResolution.verification || "pending");

      setRejectionReason(parsedResolution.rejectionReason || "");
    }
  }, [id]);

  const currentStatus =
    decision === "approved"
      ? "Resolved"
      : decision === "rejected"
        ? "In Progress"
        : resolution?.status || complaint.status;

  const timeline = [
    {
      title: "Complaint Submitted",
      description: "Your complaint has been successfully registered.",
      date: "13 Nov 2026",
      completed: true,
    },
    {
      title: "Complaint Acknowledged",
      description: "The concerned department has acknowledged the issue.",
      date: "13 Nov 2026",
      completed: true,
    },
    {
      title: "Work In Progress",
      description: "Assigned staff is working on resolving the issue.",
      date: "14 Nov 2026",
      completed: true,
    },
    {
      title:
        decision === "approved"
          ? "Resolution Approved"
          : decision === "rejected"
            ? "Resolution Rejected - Work Reopened"
            : "Resolution Verification",
      description:
        decision === "approved"
          ? "You approved the resolution. The complaint is resolved."
          : decision === "rejected"
            ? "You rejected the resolution. Staff needs to continue working."
            : resolution?.status === "Awaiting Verification"
              ? "Staff submitted the resolution for your verification."
              : "Waiting for staff to complete the repair.",
      date:
        decision !== "pending"
          ? "Updated just now"
          : resolution?.status === "Awaiting Verification"
            ? "Awaiting your response"
            : "Pending",
      completed: decision === "approved",
    },
  ];

  const handleApprove = () => {
    if (!resolution) return;

    const updatedResolution = {
      ...resolution,
      status: "Resolved",
      verification: "approved",
      verifiedAt: new Date().toISOString(),
      rejectionReason: "",
    };

    localStorage.setItem(
      `campus_resolution_${id}`,
      JSON.stringify(updatedResolution),
    );

    setResolution(updatedResolution);
    setDecision("approved");
    setMessage("You approved the resolution successfully!");
    setShowRejectForm(false);
  };

  const handleReject = (event) => {
    event.preventDefault();

    if (!rejectionReason.trim()) {
      setMessage("Please provide a reason for rejecting the resolution.");
      return;
    }

    const updatedResolution = {
      ...resolution,
      status: "In Progress",
      verification: "rejected",
      rejectionReason: rejectionReason.trim(),
      rejectedAt: new Date().toISOString(),
    };

    localStorage.setItem(
      `campus_resolution_${id}`,
      JSON.stringify(updatedResolution),
    );

    setResolution(updatedResolution);
    setDecision("rejected");
    setShowRejectForm(false);
    setMessage("Resolution rejected. The complaint has been reopened.");
  };

  const statusStyles = {
    "In Progress": "bg-blue-100 text-blue-700",
    "Awaiting Verification": "bg-purple-100 text-purple-700",
    Resolved: "bg-green-100 text-green-700",
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        to="/user/complaints"
        className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline"
      >
        <ArrowLeft size={17} />
        Back to My Complaints
      </Link>

      {/* Complaint Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              {complaint.id}
            </p>

            <h1 className="mt-2 text-2xl font-bold text-slate-800">
              {complaint.title}
            </h1>
          </div>

          <span
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              statusStyles[currentStatus]
            }`}
          >
            {currentStatus}
          </span>
        </div>

        <p className="mt-4 text-sm leading-6 text-slate-600">
          {complaint.description}
        </p>

        <div className="mt-5 flex flex-wrap gap-5 border-t border-slate-100 pt-5 text-sm text-slate-500">
          <span>
            <CalendarDays size={16} className="mr-2 inline" />
            {complaint.date}
          </span>

          <span>Department: {complaint.department}</span>

          <span className="font-semibold text-red-600">
            {complaint.priority} Priority
          </span>
        </div>
      </div>

      {/* AI Analysis */}
      <div className="rounded-xl border border-purple-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-purple-100 p-3 text-purple-600">
            <ShieldCheck size={23} />
          </div>

          <div>
            <h2 className="font-semibold text-slate-800">
              AI Complaint Analysis
            </h2>
            <p className="text-xs text-slate-500">
              Illustrative analysis for the demo
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Predicted Category</p>
            <p className="mt-2 font-semibold text-slate-800">
  {complaint.category}
</p>
          </div>

          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Recommended Department</p>
            <p className="mt-2 font-semibold text-slate-800">
              {complaint.department}
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Suggested Priority</p>
            <p className="mt-2 font-semibold text-red-600">
              {complaint.priority}
            </p>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <MapPin className="text-blue-600" />
          <h2 className="font-semibold text-slate-800">Reported Location</h2>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Latitude</p>
            <p className="mt-1 font-medium text-slate-800">
              {complaint.latitude}
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Longitude</p>
            <p className="mt-1 font-medium text-slate-800">
              {complaint.longitude}
            </p>
          </div>
        </div>
      </div>

      {/* Status Timeline */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-slate-800">
          Complaint Status Timeline
        </h2>

        <div className="mt-6 space-y-6">
          {timeline.map((item, index) => (
            <div key={item.title} className="flex gap-4">
              <div className="flex flex-col items-center">
                {item.completed ? (
                  <CheckCircle className="text-green-600" size={23} />
                ) : (
                  <Clock className="text-slate-400" size={23} />
                )}

                {index !== timeline.length - 1 && (
                  <div className="mt-2 h-10 w-0.5 bg-slate-200" />
                )}
              </div>

              <div>
                <h3 className="font-medium text-slate-800">{item.title}</h3>

                <p className="mt-1 text-sm text-slate-500">
                  {item.description}
                </p>

                <p className="mt-1 text-xs text-slate-400">{item.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resolution Evidence */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <ImageIcon className="text-blue-600" />
          <h2 className="font-semibold text-slate-800">
            Staff Resolution Evidence
          </h2>
        </div>

        {resolution?.beforeImage && resolution?.afterImage ? (
          <>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <h3 className="mb-3 font-medium text-slate-700">Before Work</h3>

                <img
                  src={resolution.beforeImage}
                  alt="Before repair"
                  className="h-64 w-full rounded-xl border border-slate-200 object-cover"
                />
              </div>

              <div>
                <h3 className="mb-3 font-medium text-slate-700">After Work</h3>

                <img
                  src={resolution.afterImage}
                  alt="After repair"
                  className="h-64 w-full rounded-xl border border-slate-200 object-cover"
                />
              </div>
            </div>

            <div className="mt-5 rounded-lg bg-slate-50 p-4">
              <h3 className="font-semibold text-slate-800">
                Staff Resolution Remarks
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {resolution.remarks}
              </p>
            </div>
          </>
        ) : (
          <div className="mt-5 rounded-lg border border-dashed border-slate-300 p-8 text-center">
            <ImageIcon className="mx-auto text-slate-400" size={32} />

            <p className="mt-3 font-medium text-slate-700">
              Resolution evidence not available yet
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Before and after photographs will appear here after staff submits
              the completed work.
            </p>
          </div>
        )}
      </div>

      {/* Student Verification */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-slate-800">
          Resolution Verification
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Compare the before and after photographs and verify whether the issue
          has actually been resolved.
        </p>

        {decision === "approved" ? (
          <div className="mt-5 rounded-lg border border-green-200 bg-green-50 p-5">
            <CheckCircle className="text-green-600" size={28} />

            <h3 className="mt-2 font-semibold text-green-800">
              Resolution Approved
            </h3>

            <p className="mt-1 text-sm text-green-700">
              You approved the staff's work. This complaint is now marked as
              resolved.
            </p>
          </div>
        ) : decision === "rejected" ? (
          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-5">
            <XCircle className="text-red-600" size={28} />

            <h3 className="mt-2 font-semibold text-red-800">
              Resolution Rejected
            </h3>

            <p className="mt-1 text-sm text-red-700">
              Your complaint has been reopened. Staff needs to continue working
              on the issue.
            </p>

            <p className="mt-3 text-sm text-red-700">
              <strong>Your reason:</strong> {resolution?.rejectionReason}
            </p>
          </div>
        ) : resolution?.status === "Awaiting Verification" ? (
          <>
            {!showRejectForm ? (
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  onClick={handleApprove}
                  className="rounded-lg bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700"
                >
                  <CheckCircle size={16} className="mr-2 inline" />
                  Approve Resolution
                </button>

                <button
                  onClick={() => {
                    setShowRejectForm(true);
                    setMessage("");
                  }}
                  className="rounded-lg bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700"
                >
                  <AlertTriangle size={16} className="mr-2 inline" />
                  Reject Resolution
                </button>
              </div>
            ) : (
              <form onSubmit={handleReject} className="mt-5 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Why are you rejecting this resolution?
                  </label>

                  <textarea
                    value={rejectionReason}
                    onChange={(event) => setRejectionReason(event.target.value)}
                    rows={4}
                    placeholder="Describe what is still wrong or what work remains..."
                    className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700"
                  >
                    <Send size={16} />
                    Submit Rejection
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowRejectForm(false);
                      setRejectionReason("");
                      setMessage("");
                    }}
                    className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </>
        ) : (
          <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-5">
            <Clock className="text-amber-600" size={25} />

            <h3 className="mt-2 font-semibold text-amber-800">
              Waiting for Staff Resolution
            </h3>

            <p className="mt-1 text-sm text-amber-700">
              You can approve or reject the work after staff uploads the before
              and after photographs and submits the resolution.
            </p>
          </div>
        )}

        {message && (
          <p className="mt-4 text-sm font-medium text-blue-600">{message}</p>
        )}
      </div>
    </div>
  );
}

export default ComplaintDetails;
