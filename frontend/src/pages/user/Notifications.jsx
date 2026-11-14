import { useState } from "react";
import {
  Bell,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ClipboardCheck,
  Check,
  CheckCheck,
} from "lucide-react";

const initialNotifications = [
  {
    id: 1,
    title: "Complaint submitted successfully",
    message:
      "Your complaint CMP-1024 regarding water leakage in Hostel Block A has been submitted.",
    time: "10 minutes ago",
    type: "success",
    read: false,
  },
  {
    id: 2,
    title: "Complaint assigned to department",
    message:
      "Your complaint CMP-1024 has been assigned to the Plumbing Department.",
    time: "1 hour ago",
    type: "info",
    read: false,
  },
  {
    id: 3,
    title: "Complaint status updated",
    message:
      "Your complaint CMP-1023 regarding the street light is now under review.",
    time: "Yesterday",
    type: "warning",
    read: true,
  },
  {
    id: 4,
    title: "Complaint resolved",
    message:
      "Your complaint CMP-1022 regarding garbage collection has been marked as resolved.",
    time: "2 days ago",
    type: "success",
    read: true,
  },
  {
    id: 5,
    title: "Resolution verification pending",
    message:
      "Please review the resolution evidence submitted for your complaint.",
    time: "3 days ago",
    type: "verification",
    read: true,
  },
];

function Notifications() {
  const [notifications, setNotifications] = useState(initialNotifications);

  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  const markAsRead = (id) => {
    setNotifications((previous) =>
      previous.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    );
  };

  const markAllAsRead = () => {
    setNotifications((previous) =>
      previous.map((notification) => ({
        ...notification,
        read: true,
      })),
    );
  };

  const iconStyles = {
    success: {
      icon: CheckCircle2,
      style: "bg-green-100 text-green-600",
    },
    info: {
      icon: ClipboardCheck,
      style: "bg-blue-100 text-blue-600",
    },
    warning: {
      icon: AlertTriangle,
      style: "bg-amber-100 text-amber-600",
    },
    verification: {
      icon: Clock,
      style: "bg-purple-100 text-purple-600",
    },
  };

  return (
    <div className="space-y-6">
      {/* Page Heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Notifications</h1>
          <p className="mt-1 text-sm text-slate-500">
            Stay updated about your complaints and their progress.
          </p>
        </div>

        <button
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
          className="flex items-center gap-2 self-start rounded-lg border border-blue-200 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CheckCheck size={17} />
          Mark all as read
        </button>
      </div>

      {/* Notification Summary */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
            <Bell size={22} />
          </div>

          <div>
            <p className="text-sm text-slate-500">Unread notifications</p>
            <h2 className="text-2xl font-bold text-slate-800">{unreadCount}</h2>
          </div>
        </div>
      </div>

      {/* Notification List */}
      <div className="space-y-3">
        {notifications.length > 0 ? (
          notifications.map((notification) => {
            const Icon = iconStyles[notification.type].icon;

            return (
              <div
                key={notification.id}
                className={`flex flex-col gap-4 rounded-xl border p-5 transition sm:flex-row sm:items-start ${
                  notification.read
                    ? "border-slate-200 bg-white"
                    : "border-blue-200 bg-blue-50/50"
                }`}
              >
                <div
                  className={`w-fit rounded-xl p-3 ${
                    iconStyles[notification.type].style
                  }`}
                >
                  <Icon size={22} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-800">
                      {notification.title}
                    </h3>

                    {!notification.read && (
                      <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                        New
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {notification.message}
                  </p>

                  <p className="mt-3 text-xs text-slate-400">
                    {notification.time}
                  </p>
                </div>

                {!notification.read && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="flex items-center gap-2 self-start rounded-lg px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100"
                  >
                    <Check size={16} />
                    Mark as read
                  </button>
                )}
              </div>
            );
          })
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
            <Bell size={40} className="mx-auto text-slate-300" />
            <h3 className="mt-3 font-semibold text-slate-700">
              No notifications
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              You are all caught up!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;
