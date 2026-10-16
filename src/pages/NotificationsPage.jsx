import { useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { api } from "../api";

const typeStyles = {
  order: "bg-limewash text-basil",
  status: "bg-sky-100 text-sky-800",
  cancelled: "bg-red-100 text-red-700",
  review: "bg-amber-100 text-amber-800",
  info: "bg-zinc-100 text-zinc-700"
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = () =>
    api
      .notifications()
      .then(setNotifications)
      .finally(() => setLoading(false));

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  const markAllRead = async () => {
    await api.markNotificationsRead();
    await loadNotifications();
  };

  if (loading) {
    return <div className="h-80 animate-pulse rounded-lg bg-white shadow-sm" />;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black">Notifications</h1>
          <p className="text-zinc-600">Updates for customers, admins, and restaurant managers.</p>
        </div>
        <button
          onClick={markAllRead}
          className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-black text-white hover:bg-zinc-800"
        >
          <CheckCheck size={17} />
          Mark all read
        </button>
      </div>

      {notifications.length === 0 ? (
        <section className="rounded-lg bg-white p-8 text-center shadow-sm ring-1 ring-zinc-200">
          <Bell className="mx-auto text-zinc-400" size={34} />
          <h2 className="mt-3 text-xl font-black">No notifications yet</h2>
          <p className="mt-2 text-zinc-600">New order and status updates will appear here.</p>
        </section>
      ) : (
        <section className="space-y-3">
          {notifications.map((notification) => (
            <article
              key={notification.id}
              className={`rounded-lg bg-white p-5 shadow-sm ring-1 ${
                notification.read ? "ring-zinc-200" : "ring-leaf"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black">{notification.title}</h2>
                  <p className="mt-1 text-sm text-zinc-600">{notification.message}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-black uppercase ${
                    typeStyles[notification.type] || typeStyles.info
                  }`}
                >
                  {notification.type}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-zinc-500">
                <span>{new Date(notification.createdAt).toLocaleString()}</span>
                <span>{notification.read ? "Read" : "Unread"}</span>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
