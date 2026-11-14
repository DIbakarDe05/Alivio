import { useState } from "react";
import {
  Bell,
  CheckCheck,
  AlertTriangle,
  ClipboardList,
  Clock,
  CheckCircle,
} from "lucide-react";

const initialNotifications = [
  {
    id: 1,
    title: "New complaint assigned",
    message:
      "A water leakage complaint (CMP-1024) has been assigned to your department.",
    time: "10 minutes ago",
    type: "assignment",
    read: false,
  },
  {
    id: 2,
    title: "High priority complaint",
    message: "CMP-1024 has been marked as a high-priority complaint.",
    time: "30 minutes ago",
    type: "urgent",
    read: false,
  },
  {
    id: 3,
    title: "Resolution submitted",
    message:
      "A complaint resolution is awaiting verification from the complainant.",
    time: "2 hours ago",
    type: "verification",
    read: false,
  },
  {
    id: 4,
    title: "Deadline approaching",
    message: "The deadline for CMP-1021 is approaching. Please take action.",
    time: "Yesterday",
    type: "deadline",
    read: true,
  },
  {
    id: 5,
    title: "Complaint resolved",
    message: "CMP-1019 has been successfully resolved.",
    time: "2 days ago",
    type: "resolved",
    read: true,
  },
];

export default function StaffNotifications() {
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
    assignment: {
      icon: ClipboardList,
      style: "bg-blue-100 text-blue-600",
    },
    urgent: {
      icon: AlertTriangle,
      style: "bg-red-100 text-red-600",
    },
    verification: {
      icon: Clock,
      style: "bg-purple-100 text-purple-600",
    },
    deadline: {
      icon: Bell,
      style: "bg-yellow-100 text-yellow-600",
    },
    resolved: {
      icon: CheckCircle,
      style: "bg-green-100 text-green-600",
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Notifications</h1>
          <p className="mt-1 text-sm text-slate-500">
            Stay updated about assigned complaints and deadlines.
          </p>
        </div>

        <button
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CheckCheck size={17} />
          Mark all as read
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">Recent Notifications</h2>

          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
            {unreadCount} Unread
          </span>
        </div>

        <div className="space-y-3">
          {notifications.map((notification) => {
            const Icon = iconStyles[notification.type].icon;

            return (
              <div
                key={notification.id}
                className={`flex gap-4 rounded-lg border p-4 ${
                  notification.read
                    ? "border-slate-100 bg-white"
                    : "border-blue-100 bg-blue-50/50"
                }`}
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                    iconStyles[notification.type].style
                  }`}
                >
                  <Icon size={20} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="font-semibold text-slate-800">
                      {notification.title}
                    </h3>

                    <span className="text-xs text-slate-400">
                      {notification.time}
                    </span>
                  </div>

                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {notification.message}
                  </p>

                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                      Mark as read
                    </button>
                  )}
                </div>

                {!notification.read && (
                  <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
