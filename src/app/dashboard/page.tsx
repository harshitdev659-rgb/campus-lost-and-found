"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Layers,
  Inbox,
  Send,
  Bookmark,
  Bell,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  Calendar,
  Eye,
  Trash2,
  Check,
  PlusCircle,
  ExternalLink,
} from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "lost" | "found" | "incoming_claims" | "my_claims" | "saved"
  >("incoming_claims");

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (res.status === 401) {
        router.push("/auth/login?redirect=/dashboard");
        return;
      }
      if (res.ok) {
        const d = await res.json();
        setData(d);
        // If there are incoming claims, stay on incoming claims; else if my claims, etc.
        if (!d.incomingClaims?.length && d.myLostReports?.length) {
          setActiveTab("lost");
        }
      }
    } catch (e) {
      console.error("Dashboard error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCloseReport = async (reportId: string) => {
    if (!confirm("Are you sure you want to mark this report as Resolved/Closed?")) return;
    try {
      const res = await fetch(`/api/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "RESOLVED" }),
      });
      if (res.ok) {
        fetchDashboardData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    try {
      const res = await fetch(`/api/reports/${reportId}`, { method: "DELETE" });
      if (res.ok) {
        fetchDashboardData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-16 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-campus-800 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-xs text-slate-500">Loading personal campus records...</p>
      </div>
    );
  }

  const incomingCount = data?.incomingClaims?.length || 0;
  const myClaimsCount = data?.mySubmittedClaims?.length || 0;
  const lostCount = data?.myLostReports?.length || 0;
  const foundCount = data?.myFoundReports?.length || 0;
  const savedCount = data?.savedListings?.length || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Student Belongings Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your campus lost and found reports, evaluate incoming ownership claims, and coordinate handovers.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/report/lost"
            className="px-3.5 py-2 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold hover:bg-amber-100 flex items-center space-x-1.5"
          >
            <PlusCircle className="w-4 h-4 text-amber-600" />
            <span>Report Lost</span>
          </Link>
          <Link
            href="/report/found"
            className="px-3.5 py-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold hover:bg-emerald-100 flex items-center space-x-1.5"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Report Found</span>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-1 overflow-x-auto pb-1 text-xs font-semibold">
        <button
          onClick={() => setActiveTab("incoming_claims")}
          className={`px-4 py-2.5 rounded-t-xl transition-colors flex items-center space-x-2 flex-shrink-0 ${
            activeTab === "incoming_claims"
              ? "bg-white border-t border-x border-slate-200 text-campus-900 shadow-sm"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Inbox className="w-4 h-4 text-blue-600" />
          <span>Incoming Claims</span>
          {incomingCount > 0 && (
            <span className="px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded-full text-[10px]">
              {incomingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("my_claims")}
          className={`px-4 py-2.5 rounded-t-xl transition-colors flex items-center space-x-2 flex-shrink-0 ${
            activeTab === "my_claims"
              ? "bg-white border-t border-x border-slate-200 text-campus-900 shadow-sm"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Send className="w-4 h-4 text-emerald-600" />
          <span>My Submitted Claims</span>
          {myClaimsCount > 0 && (
            <span className="px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded-full text-[10px]">
              {myClaimsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("lost")}
          className={`px-4 py-2.5 rounded-t-xl transition-colors flex items-center space-x-2 flex-shrink-0 ${
            activeTab === "lost"
              ? "bg-white border-t border-x border-slate-200 text-campus-900 shadow-sm"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <span>My Lost Reports ({lostCount})</span>
        </button>

        <button
          onClick={() => setActiveTab("found")}
          className={`px-4 py-2.5 rounded-t-xl transition-colors flex items-center space-x-2 flex-shrink-0 ${
            activeTab === "found"
              ? "bg-white border-t border-x border-slate-200 text-campus-900 shadow-sm"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <span>My Found Reports ({foundCount})</span>
        </button>

        <button
          onClick={() => setActiveTab("saved")}
          className={`px-4 py-2.5 rounded-t-xl transition-colors flex items-center space-x-2 flex-shrink-0 ${
            activeTab === "saved"
              ? "bg-white border-t border-x border-slate-200 text-campus-900 shadow-sm"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Bookmark className="w-4 h-4 text-amber-600" />
          <span>Saved ({savedCount})</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="space-y-4">
        {/* 1. Incoming Claims on My Found Items */}
        {activeTab === "incoming_claims" && (
          <div className="space-y-3">
            {incomingCount > 0 ? (
              data.incomingClaims.map((claim: any) => (
                <div
                  key={claim.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <StatusBadge status={claim.status} type="claim" />
                      <span className="text-xs text-slate-400">
                        Received on {new Date(claim.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">
                      Claim for: "{claim.report?.title}"
                    </h3>

                    <p className="text-xs text-slate-600">
                      Submitted by student{" "}
                      <span className="font-semibold text-slate-800">{claim.claimant?.name}</span> (
                      {claim.claimant?.collegeDomain})
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <Link
                      href={`/dashboard/claims/${claim.id}`}
                      className="w-full sm:w-auto px-4 py-2 bg-campus-800 hover:bg-campus-900 text-white rounded-xl text-xs font-semibold text-center flex items-center justify-center space-x-1.5"
                    >
                      <span>Review Answers & Handover</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500 space-y-2">
                <Inbox className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="font-semibold text-slate-700">No incoming ownership claims</p>
                <p>When someone claims an item you found, their verification answers will appear here.</p>
              </div>
            )}
          </div>
        )}

        {/* 2. My Submitted Claims */}
        {activeTab === "my_claims" && (
          <div className="space-y-3">
            {myClaimsCount > 0 ? (
              data.mySubmittedClaims.map((claim: any) => (
                <div
                  key={claim.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <StatusBadge status={claim.status} type="claim" />
                      <span className="text-xs text-slate-400">
                        Submitted {new Date(claim.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">
                      "{claim.report?.title}"
                    </h3>

                    <p className="text-xs text-slate-500 flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{claim.report?.campusLocation}</span>
                      <span>• Found by {claim.report?.user?.name}</span>
                    </p>
                  </div>

                  <Link
                    href={`/dashboard/claims/${claim.id}`}
                    className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold text-center flex items-center justify-center space-x-1.5"
                  >
                    <span>Open Claim Room</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500 space-y-2">
                <Send className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="font-semibold text-slate-700">You haven't claimed any items yet</p>
                <p>Browse campus found items to verify and recover your belongings.</p>
                <Link
                  href="/items?type=FOUND"
                  className="inline-block px-4 py-2 bg-campus-800 text-white rounded-lg font-semibold mt-2"
                >
                  Browse Found Items
                </Link>
              </div>
            )}
          </div>
        )}

        {/* 3. My Lost Reports */}
        {activeTab === "lost" && (
          <div className="space-y-3">
            {lostCount > 0 ? (
              data.myLostReports.map((report: any) => (
                <div
                  key={report.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <StatusBadge status={report.status} />
                      <span className="text-xs text-slate-500 font-semibold">{report.category}</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{report.title}</h3>
                    <p className="text-xs text-slate-500 flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{report.campusLocation}</span>
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/items/${report.id}`}
                      className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-semibold flex items-center space-x-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </Link>

                    {report.status === "ACTIVE" && (
                      <button
                        onClick={() => handleCloseReport(report.id)}
                        className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 rounded-lg text-xs font-semibold flex items-center space-x-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Mark Recovered</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteReport(report.id)}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg text-xs"
                      title="Delete report"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500 space-y-2">
                <p className="font-semibold text-slate-700">No lost reports filed</p>
                <Link
                  href="/report/lost"
                  className="inline-block px-4 py-2 bg-amber-600 text-white rounded-lg font-semibold mt-2"
                >
                  Report a Lost Item
                </Link>
              </div>
            )}
          </div>
        )}

        {/* 4. My Found Reports */}
        {activeTab === "found" && (
          <div className="space-y-3">
            {foundCount > 0 ? (
              data.myFoundReports.map((report: any) => (
                <div
                  key={report.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <StatusBadge status={report.status} />
                      <span className="text-xs text-slate-500 font-semibold">{report.category}</span>
                      {report.claims?.length > 0 && (
                        <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                          {report.claims.length} Claim{report.claims.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{report.title}</h3>
                    <p className="text-xs text-slate-500 flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{report.campusLocation}</span>
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/items/${report.id}`}
                      className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-semibold flex items-center space-x-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </Link>

                    {report.status === "ACTIVE" && (
                      <button
                        onClick={() => handleCloseReport(report.id)}
                        className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 rounded-lg text-xs font-semibold flex items-center space-x-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Close Listing</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteReport(report.id)}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg text-xs"
                      title="Delete report"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500 space-y-2">
                <p className="font-semibold text-slate-700">No found reports submitted</p>
                <Link
                  href="/report/found"
                  className="inline-block px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold mt-2"
                >
                  Report a Found Item
                </Link>
              </div>
            )}
          </div>
        )}

        {/* 5. Saved Listings */}
        {activeTab === "saved" && (
          <div className="space-y-3">
            {savedCount > 0 ? (
              data.savedListings.map((report: any) => (
                <div
                  key={report.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          report.type === "FOUND" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {report.type}
                      </span>
                      <StatusBadge status={report.status} />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{report.title}</h3>
                  </div>

                  <Link
                    href={`/items/${report.id}`}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                  >
                    View Listing
                  </Link>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500">
                You haven't bookmarked any listings yet.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
