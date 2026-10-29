"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Calendar,
  Send,
  MessageSquare,
  AlertTriangle,
  HeartHandshake,
  UserCheck,
  FileText,
} from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";

export default function ClaimDetailPage() {
  const params = useParams();
  const router = useRouter();
  const claimId = params.claimId as string;

  const [claim, setClaim] = useState<any>(null);
  const [roleInClaim, setRoleInClaim] = useState<"CLAIMANT" | "FINDER" | "ADMIN">("CLAIMANT");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status review state
  const [reviewNotes, setReviewNotes] = useState("");
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Chat message state
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);

  // Handover state
  const [handoverLocation, setHandoverLocation] = useState("");
  const [handoverTime, setHandoverTime] = useState("");
  const [handoverNotes, setHandoverNotes] = useState("");
  const [handoverUpdating, setHandoverUpdating] = useState(false);

  const fetchClaimData = async () => {
    try {
      const res = await fetch(`/api/claims/${claimId}`);
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to load claim");
      }
      const data = await res.json();
      setClaim(data.claim);
      setRoleInClaim(data.roleInClaim);
      setMessages(data.claim.messages || []);
      setHandoverLocation(data.claim.handoverLocation || "Central Library Security Desk");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (claimId) fetchClaimData();
  }, [claimId]);

  const handleStatusChange = async (newStatus: string) => {
    setStatusUpdating(true);
    try {
      const res = await fetch(`/api/claims/${claimId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          reviewerNotes: reviewNotes || undefined,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Status update failed");
      }

      await fetchClaimData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSendingMsg(true);
    try {
      const res = await fetch(`/api/claims/${claimId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newMessage }),
      });

      if (res.ok) {
        const d = await res.json();
        setMessages([...messages, d.message]);
        setNewMessage("");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSendingMsg(false);
    }
  };

  const handleScheduleHandover = async (e: React.FormEvent) => {
    e.preventDefault();
    setHandoverUpdating(true);
    try {
      const res = await fetch(`/api/claims/${claimId}/handover`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SCHEDULE",
          handoverLocation,
          handoverTime: handoverTime ? new Date(handoverTime).toISOString() : undefined,
          handoverNotes,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to schedule handover");
      }

      alert("Handover proposal saved and notified to other party.");
      await fetchClaimData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setHandoverUpdating(false);
    }
  };

  const handleConfirmCompletion = async () => {
    if (!confirm("Confirm that this item has been physically handed over to the student? This will permanently close the report.")) return;

    setHandoverUpdating(true);
    try {
      const res = await fetch(`/api/claims/${claimId}/handover`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CONFIRM_COMPLETION" }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Handover completion failed");
      }

      alert("Handover recorded and item successfully marked as RESOLVED!");
      await fetchClaimData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setHandoverUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-campus-800 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-xs text-slate-500">Securing private claim session...</p>
      </div>
    );
  }

  if (error || !claim) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-3">
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold">Access Denied / Not Found</h2>
        <p className="text-xs text-slate-500">{error || "You do not have permission to view this claim."}</p>
        <Link href="/dashboard" className="text-xs font-semibold text-campus-800 underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const isReviewer = roleInClaim === "FINDER" || roleInClaim === "ADMIN";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to My Dashboard</span>
      </Link>

      {/* Main Room Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <StatusBadge status={claim.status} type="claim" />
            <span className="text-xs text-slate-400">
              Session ID: {claim.id.slice(0, 8)}...
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Ownership Claim for: "{claim.report?.title}"
          </h1>

          <p className="text-xs text-slate-500">
            Claimant: <span className="font-semibold text-slate-800">{claim.claimant?.name}</span> • Finder:{" "}
            <span className="font-semibold text-slate-800">{claim.report?.user?.name}</span>
          </p>
        </div>

        {/* Status Callout */}
        <div className="text-right sm:border-l sm:border-slate-100 sm:pl-6">
          <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider block">
            Your Role
          </span>
          <span className="text-sm font-bold text-campus-900">
            {roleInClaim === "FINDER" ? "Item Finder (Reviewer)" : roleInClaim === "ADMIN" ? "Campus Administrator" : "Claimant (Owner)"}
          </span>
        </div>
      </div>

      {/* Two Column Layout: Left Verification Details, Right Handover & Secure Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Verification Responses */}
        <div className="lg:col-span-7 space-y-6">
          {/* Answers Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Claimant Verification Evidence</span>
            </h2>

            {/* General Claimant Notes */}
            <div className="space-y-1 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <span className="text-[11px] font-bold text-slate-500 uppercase">
                Claimant's Explanation & Unique Details:
              </span>
              <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line">
                {claim.claimantNotes}
              </p>
            </div>

            {/* Proof Image if provided */}
            {claim.proofImageUrl && (
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase">
                  Supporting Photo Uploaded by Claimant:
                </span>
                <div className="w-44 h-44 rounded-xl border border-slate-200 overflow-hidden">
                  <img
                    src={claim.proofImageUrl}
                    alt="Proof"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Specific Question Responses */}
            {claim.responses && claim.responses.length > 0 && (
              <div className="space-y-3 pt-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase block">
                  Questionnaire Answers:
                </span>

                {claim.responses.map((resp: any, i: number) => (
                  <div
                    key={resp.id}
                    className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-slate-800">
                        Q{i + 1}: {resp.question?.questionText}
                      </span>
                      {isReviewer && resp.isVerifiedMatch && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Exact Hash Match</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-700 font-mono bg-white p-2 rounded border border-slate-200">
                      Submitted Answer: "{resp.submittedAnswer}"
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Reviewer Status Actions */}
            {isReviewer && claim.status !== "COMPLETED" && (
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Reviewer Decision Controls
                </h3>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-600 block">
                    Reviewer Notes / Feedback to Claimant:
                  </label>
                  <input
                    type="text"
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="e.g. Details verified. Please meet at library front desk at 3pm."
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white"
                  />
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {claim.status === "PENDING" && (
                    <button
                      type="button"
                      disabled={statusUpdating}
                      onClick={() => handleStatusChange("UNDER_REVIEW")}
                      className="px-4 py-2 bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold rounded-lg hover:bg-blue-100 disabled:opacity-50"
                    >
                      Mark Under Review
                    </button>
                  )}

                  {claim.status !== "APPROVED" && (
                    <button
                      type="button"
                      disabled={statusUpdating}
                      onClick={() => handleStatusChange("APPROVED")}
                      className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 disabled:opacity-50 shadow-sm"
                    >
                      Approve Ownership Claim
                    </button>
                  )}

                  {claim.status !== "REJECTED" && (
                    <button
                      type="button"
                      disabled={statusUpdating}
                      onClick={() => handleStatusChange("REJECTED")}
                      className="px-4 py-2 bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold rounded-lg hover:bg-rose-100 disabled:opacity-50"
                    >
                      Reject Claim
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Handover Coordination & In-App Chat */}
        <div className="lg:col-span-5 space-y-6">
          {/* Handover Coordinator Box */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
              <HeartHandshake className="w-4 h-4 text-campus-700" />
              <span>Campus Handover Plan</span>
            </h2>

            {claim.status === "COMPLETED" ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-1.5">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h3 className="text-xs font-bold text-emerald-900">Handover Complete & Verified</h3>
                <p className="text-[11px] text-emerald-700">
                  Confirmed on {new Date(claim.handoverCompletedAt).toLocaleString()}. Belonging returned to owner!
                </p>
              </div>
            ) : claim.status === "APPROVED" ? (
              <div className="space-y-4">
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-900">
                  <span className="font-bold block">Claim Approved!</span>
                  Coordinate a campus handover location. For safety, select a public campus desk.
                </div>

                <form onSubmit={handleScheduleHandover} className="space-y-3 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Safe Handover Spot
                    </label>
                    <input
                      type="text"
                      required
                      value={handoverLocation}
                      onChange={(e) => setHandoverLocation(e.target.value)}
                      placeholder="e.g. Central Library Security Desk"
                      className="w-full p-2.5 rounded-lg border border-slate-200"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Meeting Date / Time
                    </label>
                    <input
                      type="datetime-local"
                      value={handoverTime}
                      onChange={(e) => setHandoverTime(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-200"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Special Notes
                    </label>
                    <input
                      type="text"
                      value={handoverNotes}
                      onChange={(e) => setHandoverNotes(e.target.value)}
                      placeholder="e.g. Look for student wearing blue jacket"
                      className="w-full p-2.5 rounded-lg border border-slate-200"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={handoverUpdating}
                    className="w-full py-2.5 bg-campus-800 hover:bg-campus-900 text-white font-semibold rounded-lg text-xs transition-colors"
                  >
                    Update Handover Plan
                  </button>
                </form>

                {/* Confirm Handover Button for Finder/Admin */}
                {isReviewer && (
                  <div className="pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={handleConfirmCompletion}
                      disabled={handoverUpdating}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center justify-center space-x-1.5 shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm Physical Handover (Close Report)</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-slate-500 bg-slate-50 p-4 rounded-xl text-center">
                Handover scheduling activates once the ownership claim is approved.
              </div>
            )}
          </div>

          {/* In-App Direct Messaging Box */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-96 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center space-x-2 bg-slate-50">
              <MessageSquare className="w-4 h-4 text-campus-700" />
              <span className="text-xs font-bold text-slate-800">
                Secure In-App Chat (Private)
              </span>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.length > 0 ? (
                messages.map((m: any) => {
                  const isMe = m.senderId === (roleInClaim === "CLAIMANT" ? claim.claimantId : claim.report?.userId);
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                    >
                      <div className="flex items-center space-x-1 text-[10px] text-slate-400 mb-0.5">
                        <span className="font-semibold text-slate-600">{m.sender?.name}</span>
                        <span>•</span>
                        <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      <div
                        className={`text-xs px-3.5 py-2 rounded-2xl max-w-[85%] ${
                          isMe
                            ? "bg-campus-800 text-white rounded-tr-none"
                            : "bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200"
                        }`}
                      >
                        {m.message}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 text-xs p-4">
                  <p>No messages yet.</p>
                  <p className="text-[11px] mt-1 text-slate-400">
                    Use this room to safely discuss handover without sharing raw phone numbers.
                  </p>
                </div>
              )}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-2 border-t border-slate-100 flex gap-2 bg-slate-50">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a secure message..."
                className="flex-1 text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-campus-700"
              />
              <button
                type="submit"
                disabled={sendingMsg || !newMessage.trim()}
                className="p-2 bg-campus-800 hover:bg-campus-900 text-white rounded-lg disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
