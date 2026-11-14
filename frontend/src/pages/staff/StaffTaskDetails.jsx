import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  CalendarDays,
  Upload,
  Image as ImageIcon,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  X,
} from "lucide-react";

function StaffTaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [beforeImage, setBeforeImage] = useState("");
  const [afterImage, setAfterImage] = useState("");
  const [remarks, setRemarks] = useState("");
  const [status, setStatus] = useState("Assigned");
  const [message, setMessage] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");



  const complaintRecords = {
    "CMP-1024": {
      title: "Water leakage in Hostel Block A",
      description:
        "There is continuous water leakage from a damaged pipe near the common washroom in Hostel Block A. Water is accumulating on the floor and causing inconvenience to students.",
      category: "Water & Sanitation",
      department: "Plumbing",
      priority: "High",
      location: "Hostel Block A",
      date: "13 Nov 2026",
    },

    "CMP-1023": {
      title: "Street light not working",
      description:
        "The street light is not functioning properly, causing visibility problems and inconvenience at night.",
      category: "Electrical & Equipment",
      department: "Electrical",
      priority: "Medium",
      location: "Campus",
      date: "12 Nov 2026",
    },

    "CMP-1021": {
      title: "Broken classroom bench",
      description: "A classroom bench requires maintenance and repair.",
      category: "Infrastructure",
      department: "Maintenance",
      priority: "Medium",
      location: "Campus",
      date: "08 Nov 2026",
    },

    "CMP-1019": {
      title: "Water cooler not working",
      description: "The water cooler is not functioning properly.",
      category: "Water & Sanitation",
      department: "Plumbing",
      priority: "Low",
      location: "Campus",
      date: "07 Nov 2026",
    },
  };

  const complaint = {
    id: id || "CMP-1024",
    ...(complaintRecords[id] || complaintRecords["CMP-1024"]),
  };


  const storageKey = `campus_resolution_${complaint.id}`;

  // Load previously saved resolution data.
  useEffect(() => {
    const savedData = localStorage.getItem(storageKey);

    if (savedData) {
      const data = JSON.parse(savedData);

      setBeforeImage(data.beforeImage || "");
      setAfterImage(data.afterImage || "");
      setRemarks(data.remarks || "");
      setStatus(data.status || "Assigned");
      setRejectionReason(data.rejectionReason || "");
    }
  }, [storageKey]);

  // Convert uploaded image into a Data URL for demo storage.
  const handleImageChange = (event, imageType) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Please select a valid image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("Image size must be less than 5 MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const imageData = reader.result;

      if (imageType === "before") {
        setBeforeImage(imageData);
      } else {
        setAfterImage(imageData);
      }

      setMessage("");
    };

    reader.onerror = () => {
      setMessage("Unable to read the selected image.");
    };

    reader.readAsDataURL(file);
  };

  const saveResolution = (updates) => {
    const existingData = JSON.parse(localStorage.getItem(storageKey) || "{}");

    const updatedData = {
      ...existingData,
      complaintId: complaint.id,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(storageKey, JSON.stringify(updatedData));

    return updatedData;
  };

  const startWork = () => {
    if (!beforeImage) {
      setMessage("Upload a before-work photograph first.");
      return;
    }

    saveResolution({
      beforeImage,
      afterImage: "",
      remarks: "",
      status: "In Progress",
      verification: "pending",
      rejectionReason: "",
    });

    setAfterImage("");
    setRemarks("");
    setRejectionReason("");

    setStatus("In Progress");
    setMessage("Work started successfully!");
  };

  const submitForVerification = (event) => {
    event.preventDefault();

    if (!afterImage) {
      setMessage("Upload an after-work photograph first.");
      return;
    }

    if (!remarks.trim()) {
      setMessage("Please enter the resolution remarks.");
      return;
    }

    saveResolution({
      beforeImage,
      afterImage,
      remarks: remarks.trim(),
      status: "Awaiting Verification",
      verification: "pending",
      submittedAt: new Date().toISOString(),
    });

    setStatus("Awaiting Verification");
    setMessage("Resolution submitted for student verification!");
  };

  const priorityStyles = {
    High: "bg-red-100 text-red-700",
    Medium: "bg-amber-100 text-amber-700",
    Low: "bg-green-100 text-green-700",
  };

  const statusStyles = {
    Assigned: "bg-amber-100 text-amber-700",
    "In Progress": "bg-blue-100 text-blue-700",
    "Awaiting Verification": "bg-purple-100 text-purple-700",
    Resolved: "bg-green-100 text-green-700",
  };

  const ImageUpload = ({ title, image, imageType, disabled }) => (
    <div className="space-y-3">
      <h3 className="font-semibold text-slate-800">{title}</h3>

      <label
        className={`flex min-h-48 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 transition hover:border-blue-400 hover:bg-blue-50 ${disabled ? "cursor-not-allowed opacity-60" : ""
          }`}
      >
        {image ? (
          <img src={image} alt={title} className="h-48 w-full object-cover" />
        ) : (
          <>
            <Upload size={30} className="text-slate-400" />
            <p className="mt-3 text-sm font-medium text-slate-700">
              Click to upload image
            </p>
            <p className="mt-1 text-xs text-slate-400">
              JPG, PNG or WEBP · Maximum 5 MB
            </p>
          </>
        )}

        <input
          type="file"
          accept="image/*"
          disabled={disabled}
          className="hidden"
          onChange={(event) => handleImageChange(event, imageType)}
        />
      </label>

      {image && !disabled && (
        <button
          type="button"
          onClick={() => {
            if (imageType === "before") {
              setBeforeImage("");
            } else {
              setAfterImage("");
            }
          }}
          className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
        >
          <X size={15} />
          Remove image
        </button>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate("/staff/dashboard")}
        className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600"
      >
        <ArrowLeft size={18} />
        Back to Dashboard
      </button>

      {/* Heading */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Complaint Details</h1>
        <p className="mt-1 text-sm text-slate-500">
          Review the assigned complaint and update its resolution progress.
        </p>
      </div>

      {/* Complaint Information */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-blue-600">
            {complaint.id}
          </span>

          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${priorityStyles[complaint.priority]}`}
          >
            {complaint.priority} Priority
          </span>

          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[status] || "bg-slate-100 text-slate-700"}`}
          >
            {status}
          </span>
        </div>

        <h2 className="mt-4 text-xl font-bold text-slate-800">
          {complaint.title}
        </h2>

        <p className="mt-3 leading-7 text-slate-600">{complaint.description}</p>

        <div className="mt-5 flex flex-wrap gap-5 text-sm text-slate-500">
          <span>
            <MapPin size={16} className="mr-1 inline" />
            {complaint.location}
          </span>

          <span>
            <CalendarDays size={16} className="mr-1 inline" />
            {complaint.date}
          </span>


        </div><span>
          Category:{" "}
          <strong className="text-slate-700">{complaint.category}</strong>
        </span>

        <span>
          Department:{" "}
          <strong className="text-slate-700">{complaint.department}</strong>
        </span>
      </div>

      {/* AI Complaint Analysis */}
      <div className="rounded-xl border border-purple-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-purple-100 p-3 text-purple-600">
            <CheckCircle2 size={22} />
          </div>

          <div>
            <h2 className="font-semibold text-slate-800">
              AI Complaint Analysis
            </h2>
            <p className="text-xs text-slate-500">
              AI-generated complaint classification
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
            <p className="mt-2 font-semibold text-slate-800">
              {complaint.priority}
            </p>
          </div>
        </div>
      </div>

      {/* Student Rejection Feedback */}
      {rejectionReason && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-100 p-3 text-red-600">
              <AlertTriangle size={22} />
            </div>

            <div>
              <h2 className="font-semibold text-red-800">
                Resolution Rejected by Student
              </h2>
              <p className="mt-1 text-sm text-red-600">
                Please review the feedback and fix the remaining issue.
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-red-200 bg-white p-4">
            <p className="text-sm font-medium text-slate-700">
              Student's Reason:
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {rejectionReason}
            </p>
          </div>
        </div>
      )}

      {/* Resolution Progress */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-slate-800">Resolution Progress</h2>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { label: "Assigned", done: true },
            {
              label: "In Progress",
              done: [
                "In Progress",
                "Awaiting Verification",
                "Resolved",
              ].includes(status),
            },
            {
              label: "Awaiting Verification",
              done: ["Awaiting Verification", "Resolved"].includes(status),
            },
          ].map((step, index) => (
            <div
              key={step.label}
              className={`rounded-lg p-4 ${step.done
                ? "bg-green-50 text-green-700"
                : "bg-slate-50 text-slate-400"
                }`}
            >
              <div className="flex items-center gap-2">
                {step.done ? <CheckCircle2 size={19} /> : <Clock size={19} />}
                <span className="text-sm font-medium">
                  {index + 1}. {step.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Before Image */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-start gap-3">
          <div className="rounded-lg bg-amber-100 p-3 text-amber-600">
            <ImageIcon size={22} />
          </div>

          <div>
            <h2 className="font-semibold text-slate-800">
              Before-Work Evidence
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Upload a photograph showing the original problem.
            </p>
          </div>
        </div>

        <ImageUpload
          title="Before photograph"
          image={beforeImage}
          imageType="before"
          disabled={status !== "Assigned"}
        />

        {status === "Assigned" && (
          <button
            type="button"
            onClick={startWork}
            className="mt-5 flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Clock size={17} />
            Start Work
          </button>
        )}
      </div>

      {/* After Image and Remarks */}
      <form
        onSubmit={submitForVerification}
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="mb-5 flex items-start gap-3">
          <div className="rounded-lg bg-green-100 p-3 text-green-600">
            <CheckCircle2 size={22} />
          </div>

          <div>
            <h2 className="font-semibold text-slate-800">
              Resolution Evidence
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Upload the photograph showing the repaired issue.
            </p>
          </div>
        </div>

        <fieldset disabled={status !== "In Progress"}>
          <ImageUpload
            title="After photograph"
            image={afterImage}
            imageType="after"
            disabled={status !== "In Progress"}
          />

          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Resolution Remarks
            </label>

            <textarea
              value={remarks}
              onChange={(event) => setRemarks(event.target.value)}
              rows={4}
              placeholder="Describe the work completed and how the issue was fixed..."
              className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <button
            type="submit"
            className="mt-5 flex items-center gap-2 rounded-lg bg-green-600 px-5 py-3 text-sm font-medium text-white hover:bg-green-700"
          >
            <Send size={17} />
            Submit for Verification
          </button>
        </fieldset>

        {status === "Assigned" && (
          <p className="mt-4 text-sm text-slate-500">
            Upload the before photograph and start work first.
          </p>
        )}

        {status === "Awaiting Verification" && (
          <p className="mt-4 text-sm font-medium text-purple-700">
            Resolution submitted. Waiting for student verification.
          </p>
        )}
      </form>

      {/* Feedback */}
      {message && (
        <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
          {message.includes("successfully") ||
            message.includes("verification") ? (
            <CheckCircle2 size={19} />
          ) : (
            <AlertTriangle size={19} />
          )}
          {message}
        </div>
      )}
    </div>
  );
}

export default StaffTaskDetails;
