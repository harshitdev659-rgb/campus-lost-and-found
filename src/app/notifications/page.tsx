"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCircle2,
  Inbox,
  MessageSquare,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.status === 401) {
        router.push("/auth/login?redirect=/notifications");
        return;
      }
      if (res.ok) {
        const d = await res.json();
        setNotifications(d.notifications || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch("/api/notifications", { method: "PATCH" });
      if (res.ok) {
        setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "CLAIM_SUBMITTED":
        return <Inbox className="w-5 h-5 text-blue-600" />;
      case "CLAIM_STATUS_UPDATED":
      case "HANDOVER_COMPLETED":
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case "NEW_MESSAGE":
        return <MessageSquare className="w-5 h-5 text-indigo-600" />;
      default:
        return <Bell className="w-5 h-5 text-campus-700" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Campus Notifications
          </h1>
          <p className="text-xs text-slate-500">
            Live updates on your reported belongings, verification claims, and handovers.
          </p>
        </div>

        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs font-semibold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-500">
          Loading notifications...
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-xl border transition-colors flex items-start justify-between gap-4 ${
                n.isRead
                  ? "bg-white border-slate-200 text-slate-700"
                  : "bg-blue-50/50 border-blue-200 text-slate-900"
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
                  {getIcon(n.type)}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-bold">{n.title}</h3>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-slate-400 block pt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {n.linkUrl && (
                <Link
                  href={n.linkUrl}
                  className="px-3 py-1.5 bg-campus-800 hover:bg-campus-900 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 flex-shrink-0"
                >
                  <span>Open</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500 space-y-2">
          <Bell className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="font-semibold text-slate-700">No notifications yet</p>
          <p>You'll receive alerts when someone claims your found item or updates a handover.</p>
        </div>
      )}
    </div>
  );
}
