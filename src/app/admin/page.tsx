"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Shield,
  Users,
  FileText,
  AlertTriangle,
  History,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Trash2,
  RefreshCw,
  Search,
} from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";

export default function AdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "moderation" | "users" | "audit">("overview");

  // Moderation tab state
  const [moderationReports, setModerationReports] = useState<any[]>([]);
  const [modLoading, setModLoading] = useState(false);

  // Users tab state
  const [usersList, setUsersList] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Audit logs tab state
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdminStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.status === 401 || res.status === 403) {
        router.push("/auth/login?redirect=/admin");
        return;
      }
      if (!res.ok) {
        throw new Error("Forbidden: Administrator privileges required.");
      }
      const data = await res.json();
      setStats(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchModeration = async () => {
    setModLoading(true);
    try {
      const res = await fetch("/api/admin/moderation");
      if (res.ok) {
        const d = await res.json();
        setModerationReports(d.moderationReports || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setModLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const d = await res.json();
        setUsersList(d.users || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchAudit = async () => {
    setAuditLoading(true);
    try {
      const res = await fetch("/api/admin/audit-logs?limit=50");
      if (res.ok) {
        const d = await res.json();
        setAuditLogs(d.logs || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAuditLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminStats();
  }, []);

  useEffect(() => {
    if (activeTab === "moderation") fetchModeration();
    if (activeTab === "users") fetchUsers();
    if (activeTab === "audit") fetchAudit();
  }, [activeTab]);

  const handleModerationAction = async (reportId: string, moderationId: string, action: string) => {
    try {
      const res = await fetch("/api/admin/moderation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, moderationId, action }),
      });
      if (res.ok) {
        fetchModeration();
        fetchAdminStats();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-16 text-center text-xs text-slate-500">
        Verifying administrator credentials...
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-3">
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold">Administrator Access Denied</h2>
        <p className="text-xs text-slate-500">{error}</p>
        <Link href="/" className="text-xs font-semibold text-campus-800 underline">
          Back to Homepage
        </Link>
      </div>
    );
  }

  const metrics = stats?.metrics || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-purple-900 text-white p-6 sm:p-8 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-800 text-purple-200 text-xs font-semibold">
            <Shield className="w-4 h-4 text-purple-300" />
            <span>Campus Security & Admin Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Administrator Console
          </h1>
          <p className="text-xs text-purple-200">
            Platform-wide metrics, flagged content moderation, user management, and security audit logs.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2.5 rounded-t-xl transition-colors ${
            activeTab === "overview"
              ? "bg-white border-t border-x border-slate-200 text-purple-900 shadow-sm"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          Overview & Metrics
        </button>

        <button
          onClick={() => setActiveTab("moderation")}
          className={`px-4 py-2.5 rounded-t-xl transition-colors flex items-center space-x-1.5 ${
            activeTab === "moderation"
              ? "bg-white border-t border-x border-slate-200 text-purple-900 shadow-sm"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <span>Flagged Content</span>
          {metrics.pendingModeration > 0 && (
            <span className="px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded-full text-[10px]">
              {metrics.pendingModeration}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2.5 rounded-t-xl transition-colors ${
            activeTab === "users"
              ? "bg-white border-t border-x border-slate-200 text-purple-900 shadow-sm"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          User Permissions
        </button>

        <button
          onClick={() => setActiveTab("audit")}
          className={`px-4 py-2.5 rounded-t-xl transition-colors ${
            activeTab === "audit"
              ? "bg-white border-t border-x border-slate-200 text-purple-900 shadow-sm"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          Security Audit Logs
        </button>
      </div>

      {/* 1. Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Registered Users</span>
              <p className="text-2xl font-bold text-slate-900">{metrics.totalUsers || 0}</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Active Reports</span>
              <p className="text-2xl font-bold text-slate-900">{metrics.activeReports || 0}</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Recovered Items</span>
              <p className="text-2xl font-bold text-emerald-600">{metrics.resolvedReports || 0}</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Pending Claims</span>
              <p className="text-2xl font-bold text-amber-600">{metrics.pendingClaims || 0}</p>
            </div>
          </div>

          {/* Recent Audit Feed */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <History className="w-4 h-4 text-purple-600" />
              <span>Recent Security Events</span>
            </h3>

            <div className="space-y-2">
              {stats?.recentAuditLogs?.map((log: any) => (
                <div
                  key={log.id}
                  className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-xs flex justify-between items-center"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-purple-900 bg-purple-50 px-2 py-0.5 rounded">
                        {log.action}
                      </span>
                      <span className="text-slate-600">
                        Actor: {log.actor ? log.actor.name : "System / Unauthenticated"}
                      </span>
                    </div>
                    {log.metadata && (
                      <p className="text-[11px] text-slate-500 font-mono truncate max-w-lg">
                        {log.metadata}
                      </p>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. Flagged Content Moderation */}
      {activeTab === "moderation" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900">
              Community Moderation Queue
            </h3>
            <button
              onClick={fetchModeration}
              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-xs"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {modLoading ? (
            <div className="py-8 text-center text-xs text-slate-500">Loading flags...</div>
          ) : moderationReports.length > 0 ? (
            <div className="space-y-3">
              {moderationReports.map((mod: any) => (
                <div
                  key={mod.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                        Reason: {mod.reason}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">
                        Reported Item: "{mod.report?.title}"
                      </h4>
                      <p className="text-xs text-slate-500">
                        Flagged by {mod.reporter?.name} • Listing Author: {mod.report?.user?.name}
                      </p>
                    </div>

                    <div className="flex space-x-2">
                      <Link
                        href={`/items/${mod.reportId}`}
                        target="_blank"
                        className="px-3 py-1 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-semibold flex items-center space-x-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Listing</span>
                      </Link>
                    </div>
                  </div>

                  {mod.details && (
                    <p className="text-xs text-slate-700 bg-white p-2.5 rounded border border-slate-200">
                      User Note: "{mod.details}"
                    </p>
                  )}

                  <div className="flex gap-2 pt-1 border-t border-slate-200">
                    <button
                      onClick={() => handleModerationAction(mod.reportId, mod.id, "HIDE_REPORT")}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1"
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Hide Listing from Campus</span>
                    </button>

                    <button
                      onClick={() => handleModerationAction(mod.reportId, mod.id, "RESTORE_REPORT")}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
                    >
                      Restore Listing
                    </button>

                    <button
                      onClick={() => handleModerationAction(mod.reportId, mod.id, "DISMISS_FLAG")}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold"
                    >
                      Dismiss Flag
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-500">
              No flagged content in moderation queue.
            </div>
          )}
        </div>
      )}

      {/* 3. User Permissions */}
      {activeTab === "users" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900">User Account Roles & Access</h3>

          {usersLoading ? (
            <div className="py-8 text-center text-xs text-slate-500">Loading users...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold">
                    <th className="py-2.5">Name</th>
                    <th className="py-2.5">Campus Email</th>
                    <th className="py-2.5">Domain</th>
                    <th className="py-2.5">Role</th>
                    <th className="py-2.5">Joined</th>
                    <th className="py-2.5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersList.map((u) => (
                    <tr key={u.id}>
                      <td className="py-3 font-semibold text-slate-900">{u.name}</td>
                      <td className="py-3 text-slate-600">{u.email}</td>
                      <td className="py-3 text-slate-500 font-mono">@{u.collegeDomain}</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded font-bold ${
                            u.role === "ADMIN"
                              ? "bg-purple-100 text-purple-800"
                              : u.role === "STAFF"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="p-1 rounded border border-slate-200 bg-white text-[11px]"
                        >
                          <option value="STUDENT">Student</option>
                          <option value="STAFF">Campus Staff</option>
                          <option value="ADMIN">Administrator</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 4. Security Audit Logs */}
      {activeTab === "audit" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900">
              Immutable Security Audit Trail
            </h3>
            <button
              onClick={fetchAudit}
              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-xs"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {auditLoading ? (
            <div className="py-8 text-center text-xs text-slate-500">Loading audit log...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold">
                    <th className="py-2.5">Timestamp</th>
                    <th className="py-2.5">Action</th>
                    <th className="py-2.5">Target</th>
                    <th className="py-2.5">Actor</th>
                    <th className="py-2.5">Metadata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="py-2.5 text-slate-500">
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </td>
                      <td className="py-2.5 font-bold text-purple-900">{log.action}</td>
                      <td className="py-2.5 text-slate-600">{log.targetType}</td>
                      <td className="py-2.5 text-slate-800">
                        {log.actor ? log.actor.email : "System"}
                      </td>
                      <td className="py-2.5 text-slate-500 truncate max-w-xs">{log.metadata || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
