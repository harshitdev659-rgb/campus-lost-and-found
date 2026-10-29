"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Upload,
  MapPin,
  Calendar,
  Lock,
  Plus,
  Trash2,
  AlertCircle,
  HelpCircle,
  ArrowLeft,
  X,
  ShieldCheck,
} from "lucide-react";
import { CAMPUS_CONFIG } from "@/lib/campus-config";

interface QuestionConfig {
  id: string;
  questionText: string;
  expectedAnswer: string;
  hint: string;
  isRequired: boolean;
}

export default function ReportFoundPage() {
  const router = useRouter();

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [dateEvent, setDateEvent] = useState(new Date().toISOString().split("T")[0]);
  const [campusLocation, setCampusLocation] = useState(CAMPUS_CONFIG.locations[0]);
  const [building, setBuilding] = useState("");
  const [floor, setFloor] = useState("");
  const [room, setRoom] = useState("");
  const [distinguishingFeatures, setDistinguishingFeatures] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  // Dynamic verification questions builder
  const [questions, setQuestions] = useState<QuestionConfig[]>([
    {
      id: "q-1",
      questionText: "What lockscreen wallpaper or distinctive sticker is on the item?",
      expectedAnswer: "",
      hint: "Look at unique markings",
      isRequired: true,
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addQuestion = () => {
    if (questions.length >= 4) {
      alert("A maximum of 4 verification questions is recommended.");
      return;
    }
    setQuestions([
      ...questions,
      {
        id: `q-${Date.now()}`,
        questionText: "",
        expectedAnswer: "",
        hint: "",
        isRequired: true,
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, idx) => idx !== index));
  };

  const updateQuestion = (index: number, field: keyof QuestionConfig, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image exceeds 5MB size limit.");
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
        throw new Error(d.error || "Image upload failed");
      }

      const data = await res.json();
      setImageUrl(data.url);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Filter out empty questions
      const validQuestions = questions
        .filter((q) => q.questionText.trim().length > 0)
        .map((q) => ({
          questionText: q.questionText.trim(),
          expectedAnswer: q.expectedAnswer.trim() || undefined,
          hint: q.hint.trim() || undefined,
          isRequired: q.isRequired,
          answerType: "TEXT" as const,
        }));

      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "FOUND",
          title,
          description,
          category,
          dateEvent: new Date(dateEvent).toISOString(),
          campusLocation,
          building: building.trim() || undefined,
          floor: floor.trim() || undefined,
          room: room.trim() || undefined,
          distinguishingFeatures: distinguishingFeatures.trim() || undefined,
          imageUrl: imageUrl || undefined,
          verificationQuestions: validQuestions,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          router.push("/auth/login?redirect=/report/found");
          return;
        }
        throw new Error(data.error || "Failed to publish found report");
      }

      router.push(`/items/${data.report.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <Link
        href="/items"
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Listings</span>
      </Link>

      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 space-y-2">
        <div className="inline-flex items-center space-x-1.5 text-emerald-800 text-xs font-bold uppercase tracking-wider">
          <CheckCircle2 className="w-4 h-4" />
          <span>Report a Found Item</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">
          Help return a lost item to its owner
        </h1>
        <p className="text-xs text-slate-600">
          Post the general item details and set security questions so only the rightful student owner can claim it.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Basic Info */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Item Information
          </h2>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Item Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Set of 3 brass keys with blue motorcycle tag"
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-campus-700"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white"
              >
                {CAMPUS_CONFIG.categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Date Found <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={dateEvent}
                onChange={(e) => setDateEvent(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              General Public Description <span className="text-rose-500">*</span>
            </label>
            <p className="text-[11px] text-slate-500">
              Tip: Describe only general features. Do not reveal secret details (e.g., mention "keys" but do not reveal the exact name written on the keychain).
            </p>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe general location found and general appearance..."
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-campus-700"
            />
          </div>
        </div>

        {/* Location Specs */}
        <div className="space-y-4 pt-2">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center space-x-1.5">
            <MapPin className="w-4 h-4 text-campus-700" />
            <span>Campus Location Where Found</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="block text-xs font-bold text-slate-800">
                General Campus Zone <span className="text-rose-500">*</span>
              </label>
              <select
                value={campusLocation}
                onChange={(e) => setCampusLocation(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white"
              >
                {CAMPUS_CONFIG.locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">Building / Block</label>
              <input
                type="text"
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                placeholder="e.g. Central Library 2nd Floor"
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">Floor & Room</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  placeholder="Floor"
                  className="w-1/2 text-xs p-2.5 rounded-lg border border-slate-200"
                />
                <input
                  type="text"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="Desk / Room"
                  className="w-1/2 text-xs p-2.5 rounded-lg border border-slate-200"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Verification Questions Builder */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
                <Lock className="w-4 h-4 text-emerald-600" />
                <span>Ownership Verification Questions</span>
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Questions claimants must answer to prove the item belongs to them.
              </p>
            </div>
            <button
              type="button"
              onClick={addQuestion}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1 bg-emerald-50 px-2.5 py-1 rounded-lg"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Question</span>
            </button>
          </div>

          <div className="space-y-3">
            {questions.map((q, idx) => (
              <div
                key={q.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3 relative group"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700">Question #{idx + 1}</span>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(idx)}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold text-slate-600">
                    Question to Ask Claimant <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={q.questionText}
                    onChange={(e) => updateQuestion(idx, "questionText", e.target.value)}
                    placeholder="e.g. What color is the lanyard? What brand is the water bottle?"
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-slate-600">
                      Expected Answer (Hashed securely on server)
                    </label>
                    <input
                      type="text"
                      value={q.expectedAnswer}
                      onChange={(e) => updateQuestion(idx, "expectedAnswer", e.target.value)}
                      placeholder="e.g. Red Nike lanyard"
                      className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                    />
                    <span className="text-[10px] text-slate-400 block">
                      Never revealed to claimants. Cryptographically hashed.
                    </span>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-slate-600">
                      Hint to display to claimant (optional)
                    </label>
                    <input
                      type="text"
                      value={q.hint}
                      onChange={(e) => updateQuestion(idx, "hint", e.target.value)}
                      placeholder="e.g. Brand and color of attachment"
                      className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Photo Upload */}
        <div className="space-y-2 pt-2">
          <label className="block text-xs font-bold text-slate-800">Item Photo (Recommended)</label>
          <p className="text-[11px] text-slate-500">
            Upload a photo showing the found item. (Max 5MB).
          </p>

          {imageUrl ? (
            <div className="relative w-36 h-36 rounded-xl border border-slate-200 overflow-hidden group">
              <img src={imageUrl} alt="Uploaded item" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setImageUrl("")}
                className="absolute top-1.5 right-1.5 p-1 bg-rose-600 text-white rounded-full shadow hover:bg-rose-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 hover:border-campus-400 rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100/50 transition-colors">
              <Upload className="w-6 h-6 text-slate-400 mb-1" />
              <span className="text-xs font-semibold text-slate-700">
                {uploadingImage ? "Uploading image..." : "Upload photo of found item"}
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
          <span className="text-xs text-slate-400">Questions are protected by bcrypt encryption.</span>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Publishing...</span>
              </>
            ) : (
              <span>Publish Found Report</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
