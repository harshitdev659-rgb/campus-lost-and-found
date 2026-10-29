"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  ArrowLeft,
  AlertCircle,
  HelpCircle,
  Upload,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default function ClaimPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [claimantNotes, setClaimantNotes] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadItem() {
      try {
        const res = await fetch(`/api/reports/${id}`);
        if (!res.ok) {
          throw new Error("Unable to fetch item for claim verification.");
        }
        const data = await res.json();
        setReport(data.report);

        // Pre-initialize empty answer state for verification questions
        if (data.report?.verificationQuestions) {
          const initialAns: Record<string, string> = {};
          data.report.verificationQuestions.forEach((q: any) => {
            initialAns[q.id] = "";
          });
          setAnswers(initialAns);
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    loadItem();
  }, [id]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image exceeds 5MB limit.");
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Upload failed");
      }

      const data = await res.json();
      setProofImage(data.url);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);

    try {
      // Format answers payload
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer: answer.trim(),
      }));

      const res = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId: id,
          claimantNotes,
          proofImageUrl: proofImage || undefined,
          answers: formattedAnswers,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          router.push(`/auth/login?redirect=/items/${id}/claim`);
          return;
        }
        throw new Error(data.error || "Failed to submit ownership claim");
      }

      setSubmitSuccess(data.claimId);
      setTimeout(() => {
        router.push(`/dashboard/claims/${data.claimId}`);
      }, 1500);
    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-campus-800 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-xs text-slate-500">Loading ownership questionnaire...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-3">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold">Item Not Available</h2>
        <p className="text-xs text-slate-500">{error}</p>
        <Link href="/items" className="text-xs font-semibold text-campus-700 underline">
          Back to Listings
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Back button */}
      <Link
        href={`/items/${id}`}
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Item Details</span>
      </Link>

      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center space-x-2 text-emerald-700">
          <ShieldCheck className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Ownership Verification</span>
        </div>

        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Claim Possession: {report.title}
        </h1>

        <p className="text-xs text-slate-600 leading-relaxed">
          To protect campus belongings against theft and unauthorized claims, please provide proof of ownership. The finder and campus moderators will review your responses privately.
        </p>
      </div>

      {submitSuccess ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <h2 className="text-lg font-bold text-emerald-900">Claim Submitted Successfully!</h2>
          <p className="text-xs text-emerald-700 max-w-sm mx-auto">
            Your verification answers were delivered privately to the item reviewer. Redirecting to your secure claim room...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          {submitError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Verification Questions Section */}
          {report.verificationQuestions && report.verificationQuestions.length > 0 ? (
            <div className="space-y-4 pt-2">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
                <Lock className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Verification Questions (Configured by Finder)
                </h3>
              </div>

              <div className="space-y-4">
                {report.verificationQuestions.map((q: any, idx: number) => (
                  <div key={q.id} className="space-y-1.5 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                    <label className="block text-xs font-bold text-slate-800">
                      Question {idx + 1}: {q.questionText}
                      {q.isRequired && <span className="text-rose-500 ml-1">*</span>}
                    </label>

                    {q.hint && (
                      <p className="text-[11px] text-slate-500 italic">Hint: {q.hint}</p>
                    )}

                    <input
                      type="text"
                      required={q.isRequired}
                      value={answers[q.id] || ""}
                      onChange={(e) =>
                        setAnswers({ ...answers, [q.id]: e.target.value })
                      }
                      placeholder="Type your exact answer..."
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-campus-700"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-start space-x-2">
              <HelpCircle className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
              <span>
                The finder did not configure automated questions. Please describe unique characteristics below.
              </span>
            </div>
          )}

          {/* Claimant Notes / Distinctive Details */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Proof of Ownership & Non-Public Details <span className="text-rose-500">*</span>
            </label>
            <p className="text-[11px] text-slate-500">
              Describe identifying markings, exact contents, receipts, serial numbers, purchase dates, or specific scratches that only the genuine owner would know.
            </p>
            <textarea
              required
              rows={4}
              value={claimantNotes}
              onChange={(e) => setClaimantNotes(e.target.value)}
              placeholder="e.g. Inside the left pouch there is a black Parker pen and a Stanford library card ending in 4491..."
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-campus-700"
            />
          </div>

          {/* Optional Proof Photo Upload (receipt, old photo of item) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800">
              Supporting Proof Photo (Optional)
            </label>
            <p className="text-[11px] text-slate-500">
              Upload an earlier photo of you with the item, a store invoice, or warranty card (Max 5MB).
            </p>

            {proofImage ? (
              <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <img
                  src={proofImage}
                  alt="Proof preview"
                  className="w-16 h-16 object-cover rounded-lg border border-slate-200"
                />
                <div className="text-xs">
                  <span className="font-semibold text-emerald-700 block">Proof Image Attached</span>
                  <button
                    type="button"
                    onClick={() => setProofImage(null)}
                    className="text-rose-600 hover:underline mt-1"
                  >
                    Remove Photo
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 hover:border-campus-400 rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100/50 transition-colors">
                <Upload className="w-6 h-6 text-slate-400 mb-1" />
                <span className="text-xs font-semibold text-slate-700">
                  {uploadingImage ? "Uploading file..." : "Click to select proof photo"}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">JPEG, PNG, WEBP (under 5MB)</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Your details will be reviewed securely.
            </span>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting Claim...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Submit Ownership Claim</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
