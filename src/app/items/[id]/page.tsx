"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  MapPin,
  Calendar,
  ShieldAlert,
  ShieldCheck,
  Bookmark,
  Flag,
  Share2,
  Lock,
  ArrowLeft,
  Building,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  EyeOff,
  User,
} from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [report, setReport] = useState<any>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [userClaimId, setUserClaimId] = useState<string | null>(null);
  const [userClaimStatus, setUserClaimStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Moderation flag modal state
  const [flagModalOpen, setFlagModalOpen] = useState(false);
  const [flagReason, setFlagReason] = useState("Suspected fraudulent listing");
  const [flagDetails, setFlagDetails] = useState("");
  const [flagSubmitting, setFlagSubmitting] = useState(false);
  const [flagSuccess, setFlagSuccess] = useState(false);

  const fetchDetail = async () => {
    try {
      const res = await fetch(`/api/reports/${id}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to load listing");
      }
      const data = await res.json();
      setReport(data.report);
      setIsOwner(data.isOwner);
      setIsSaved(data.isSaved);
      setUserClaimId(data.userClaimId);
      setUserClaimStatus(data.userClaimStatus);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  const toggleSave = async () => {
    try {
      const res = await fetch(`/api/reports/${id}/save`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setIsSaved(data.saved);
      } else if (res.status === 401) {
        router.push("/auth/login?redirect=" + encodeURIComponent(`/items/${id}`));
      }
    } catch (e) {
      console.error("Save error", e);
    }
  };

  const handleFlagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFlagSubmitting(true);
    try {
      const res = await fetch(`/api/reports/${id}/moderate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: flagReason, details: flagDetails }),
      });
      if (res.ok) {
        setFlagSuccess(true);
        setTimeout(() => {
          setFlagModalOpen(false);
          setFlagSuccess(false);
        }, 2000);
      } else if (res.status === 401) {
        router.push("/auth/login");
      }
    } catch (e) {
      console.error("Flag error", e);
    } finally {
      setFlagSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-campus-800 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-xs text-slate-500">Loading item specifications...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Listing Unavailable</h2>
        <p className="text-xs text-slate-500">{error || "This report does not exist or has been removed."}</p>
        <Link
          href="/items"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold px-4 py-2 bg-campus-800 text-white rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Browse</span>
        </Link>
      </div>
    );
  }

  const isFound = report.type === "FOUND";
  const formattedDate = new Date(report.dateEvent).toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button and quick actions */}
      <div className="flex justify-between items-center">
        <Link
          href="/items"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Listings</span>
        </Link>

        <div className="flex items-center space-x-2">
          <button
            onClick={toggleSave}
            className={`p-2 rounded-lg border text-xs font-medium flex items-center space-x-1.5 transition-colors ${
              isSaved
                ? "bg-amber-50 text-amber-800 border-amber-200"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? "fill-amber-600 text-amber-600" : ""}`} />
            <span className="hidden sm:inline">{isSaved ? "Saved" : "Save"}</span>
          </button>

          <button
            onClick={() => setFlagModalOpen(true)}
            className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-rose-600 hover:bg-rose-50 text-xs font-medium flex items-center space-x-1.5"
            title="Report suspicious listing"
          >
            <Flag className="w-4 h-4" />
            <span className="hidden sm:inline">Report</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Image & Right Specs */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        {/* Left: Image / Photo */}
        <div className="md:col-span-5 space-y-4">
          <div className="w-full h-80 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 relative flex items-center justify-center">
            {report.imageUrl ? (
              <img
                src={report.imageUrl}
                alt={report.title}
                className="w-full h-full object-contain bg-slate-900/5"
              />
            ) : (
              <div className="text-center p-6 text-slate-400">
                <HelpCircle className="w-12 h-12 mx-auto mb-2 stroke-1" />
                <p className="text-xs font-medium text-slate-500">No Image Uploaded</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Item verification relies on distinctive characteristic answers.
                </p>
              </div>
            )}

            <div className="absolute top-3 left-3 flex space-x-1.5">
              <span
                className={`px-3 py-1 rounded-md text-xs font-bold uppercase shadow-sm ${
                  isFound ? "bg-emerald-600 text-white" : "bg-amber-600 text-white"
                }`}
              >
                {report.type}
              </span>
              <StatusBadge status={report.status} />
            </div>
          </div>

          {/* Privacy Notice Box */}
          <div className="bg-campus-50 rounded-xl p-4 border border-campus-100 flex items-start space-x-3">
            <ShieldCheck className="w-5 h-5 text-campus-700 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-campus-900 leading-relaxed">
              <span className="font-semibold block">Campus Privacy Protection</span>
              Direct phone numbers and personal emails are never shared publicly. All claim verification and handover scheduling occur strictly within the platform.
            </div>
          </div>
        </div>

        {/* Right: Details & Action */}
        <div className="md:col-span-7 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1.5">
                <span className="font-semibold text-campus-700 bg-campus-50 px-2.5 py-1 rounded-md">
                  {report.category}
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formattedDate}</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {report.title}
              </h1>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                Item Description
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {report.description}
              </p>
            </div>

            {/* Location Specs */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2.5">
              <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center space-x-1.5">
                <MapPin className="w-4 h-4 text-campus-700" />
                <span>Campus Location Details</span>
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block">General Area:</span>
                  <span className="font-semibold text-slate-800">{report.campusLocation}</span>
                </div>
                {report.building && (
                  <div>
                    <span className="text-slate-400 block">Building / Block:</span>
                    <span className="font-semibold text-slate-800">{report.building}</span>
                  </div>
                )}
                {report.floor && (
                  <div>
                    <span className="text-slate-400 block">Floor / Level:</span>
                    <span className="font-semibold text-slate-800">{report.floor}</span>
                  </div>
                )}
                {report.room && (
                  <div>
                    <span className="text-slate-400 block">Classroom / Lab / Room:</span>
                    <span className="font-semibold text-slate-800">{report.room}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Distinguishing Characteristics Protection Banner */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-1.5">
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-800">
                <Lock className="w-4 h-4 text-amber-600" />
                <span>Confidential Distinguishing Features</span>
              </div>
              {isOwner ? (
                <div className="text-xs text-slate-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                  <span className="font-semibold block text-amber-900">Owner View:</span>
                  {report.distinguishingFeatures || "None specified"}
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  Unique traits (serial numbers, sticker layout, lockscreen wallpaper, or internal contents) are kept confidential to prevent fraudulent ownership claims.
                </p>
              )}
            </div>
          </div>

          {/* Action Trigger Card */}
          <div className="pt-4 border-t border-slate-100">
            {isOwner ? (
              <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-600">You are the author of this report.</span>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 bg-campus-800 text-white rounded-lg text-xs font-semibold hover:bg-campus-900"
                >
                  Manage in Dashboard
                </Link>
              </div>
            ) : isFound ? (
              report.status === "ACTIVE" ? (
                userClaimStatus ? (
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-blue-900">
                        Claim Status: {userClaimStatus}
                      </p>
                      <p className="text-[11px] text-blue-700 mt-0.5">
                        You have already submitted a verification claim for this item.
                      </p>
                    </div>
                    <Link
                      href={`/dashboard/claims/${userClaimId}`}
                      className="px-4 py-2 bg-campus-800 text-white rounded-lg text-xs font-semibold hover:bg-campus-900"
                    >
                      View Claim Room
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      href={`/items/${id}/claim`}
                      className="w-full flex items-center justify-center space-x-2 py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition-colors"
                    >
                      <ShieldCheck className="w-5 h-5" />
                      <span>This Is Mine — Verify Ownership & Claim</span>
                    </Link>
                    <p className="text-[11px] text-center text-slate-400">
                      You will be asked to answer questions configured by the finder.
                    </p>
                  </div>
                )
              ) : (
                <div className="p-4 bg-slate-100 rounded-xl text-center text-xs font-medium text-slate-600">
                  This item is currently {report.status.toLowerCase()} and cannot accept new claims.
                </div>
              )
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                <p className="text-xs font-semibold text-amber-900">
                  Have you found this lost item?
                </p>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Help return this belonging to its student owner! You can submit a Found report or hand it over directly to Central Campus Security.
                </p>
                <Link
                  href="/report/found"
                  className="inline-block px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold"
                >
                  Report You Found This
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Moderation Flag Modal */}
      {flagModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center space-x-2 text-rose-600">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="text-base font-bold text-slate-900">Report Inappropriate Listing</h3>
            </div>

            {flagSuccess ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 text-xs rounded-lg font-medium text-center">
                Report submitted to campus moderation team. Thank you for keeping campus safe!
              </div>
            ) : (
              <form onSubmit={handleFlagSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Reason for report</label>
                  <select
                    value={flagReason}
                    onChange={(e) => setFlagReason(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="Suspected fraudulent listing">Suspected fraudulent listing</option>
                    <option value="Contains offensive or prohibited content">Contains offensive or prohibited content</option>
                    <option value="Duplicate or spam submission">Duplicate or spam submission</option>
                    <option value="Publicly exposes someone's private personal phone number/ID">Publicly exposes personal contact info</option>
                    <option value="Other security concern">Other security concern</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Additional details (optional)</label>
                  <textarea
                    rows={3}
                    value={flagDetails}
                    onChange={(e) => setFlagDetails(e.target.value)}
                    placeholder="Provide any details to assist moderators..."
                    className="w-full p-2.5 rounded-lg border border-slate-200"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setFlagModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={flagSubmitting}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg disabled:opacity-50"
                  >
                    {flagSubmitting ? "Submitting..." : "Submit Report"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
