import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  User,
  Mail,
  ShieldCheck,
  Pencil,
  Save,
  X,
  CircleUserRound,
} from "lucide-react";

function Profile() {
  const { user, login } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [savedMessage, setSavedMessage] = useState("");

  const handleSave = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setSavedMessage("Name cannot be empty.");
      return;
    }

    const updatedUser = {
      ...user,
      name: name.trim(),
    };

    login(updatedUser);
    setIsEditing(false);
    setSavedMessage("Profile updated successfully!");
  };

  const handleCancel = () => {
    setName(user?.name || "");
    setIsEditing(false);
    setSavedMessage("");
  };

  const formattedRole = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : "Complainant";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Page Heading */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
        <p className="mt-1 text-sm text-slate-500">
          View and manage your account information.
        </p>
      </div>

      {/* Profile Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <CircleUserRound size={48} />
          </div>

          <div className="text-center sm:text-left">
            <h2 className="text-xl font-bold text-slate-800">
              {user?.name || "Campus User"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {user?.email || "No email available"}
            </p>
            <span className="mt-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
              {formattedRole}
            </span>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Personal Information
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Your basic account details.
            </p>
          </div>

          {!isEditing && (
            <button
              onClick={() => {
                setSavedMessage("");
                setIsEditing(true);
              }}
              className="flex items-center gap-2 rounded-lg border border-blue-200 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
            >
              <Pencil size={16} />
              Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Full Name
            </label>

            <div className="flex items-center gap-3 rounded-lg border border-slate-200 px-3">
              <User size={18} className="text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!isEditing}
                className="w-full bg-transparent py-3 text-sm text-slate-700 outline-none disabled:cursor-not-allowed"
                placeholder="Enter your full name"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Email Address
            </label>

            <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3">
              <Mail size={18} className="text-slate-400" />
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full bg-transparent py-3 text-sm text-slate-500 outline-none"
              />
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Email changes will be managed through account settings later.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Account Role
            </label>

            <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3">
              <ShieldCheck size={18} className="text-slate-400" />
              <input
                type="text"
                value={formattedRole}
                disabled
                className="w-full bg-transparent py-3 text-sm text-slate-500 outline-none"
              />
            </div>
          </div>

          {savedMessage && (
            <p className="text-sm text-green-600">{savedMessage}</p>
          )}

          {isEditing && (
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                <Save size={16} />
                Save Changes
              </button>

              <button
                type="button"
                onClick={handleCancel}
                className="flex items-center gap-2 rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                <X size={16} />
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Account Information */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800">
          Account Information
        </h2>

        <div className="mt-4 flex items-start gap-3">
          <ShieldCheck className="mt-1 text-green-600" size={20} />
          <div>
            <p className="text-sm font-medium text-slate-700">
              Role-based account
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Your account role determines which CampusResolve features you can
              access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
