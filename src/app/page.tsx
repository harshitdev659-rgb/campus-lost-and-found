"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  PlusCircle,
  CheckCircle2,
  ShieldCheck,
  Lock,
  ArrowRight,
  MapPin,
  Laptop,
  CreditCard,
  BookOpen,
  Briefcase,
  PenTool,
  Shirt,
  Glasses,
  Key,
  CupSoda,
  FlaskConical,
  HelpCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import { ReportCard, ReportItem } from "@/components/ReportCard";
import { CAMPUS_CONFIG } from "@/lib/campus-config";

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [recentReports, setRecentReports] = useState<ReportItem[]>([]);
  const [stats, setStats] = useState({ active: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const res = await fetch("/api/reports?limit=6&sort=newest");
        if (res.ok) {
          const data = await res.json();
          setRecentReports(data.reports || []);
          setStats({
            active: data.pagination?.total || 0,
            resolved: 142, // benchmark
          });
        }
      } catch (e) {
        console.error("Error loading recent reports", e);
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/items?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/items");
    }
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case "Laptop":
        return <Laptop className="w-5 h-5 text-blue-600" />;
      case "CreditCard":
        return <CreditCard className="w-5 h-5 text-rose-600" />;
      case "BookOpen":
        return <BookOpen className="w-5 h-5 text-amber-600" />;
      case "Briefcase":
        return <Briefcase className="w-5 h-5 text-purple-600" />;
      case "PenTool":
        return <PenTool className="w-5 h-5 text-indigo-600" />;
      case "Shirt":
        return <Shirt className="w-5 h-5 text-cyan-600" />;
      case "Glasses":
        return <Glasses className="w-5 h-5 text-teal-600" />;
      case "Key":
        return <Key className="w-5 h-5 text-yellow-600" />;
      case "CupSoda":
        return <CupSoda className="w-5 h-5 text-sky-600" />;
      case "FlaskConical":
        return <FlaskConical className="w-5 h-5 text-emerald-600" />;
      default:
        return <HelpCircle className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="bg-campus-900 text-white relative overflow-hidden pt-16 pb-20 px-4 sm:px-6 lg:px-8 border-b border-campus-800">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-campus-800/80 border border-campus-700 text-blue-200 text-xs font-semibold tracking-wide">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Official University Lost & Found Network</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white max-w-3xl mx-auto leading-tight">
            Lost Something on Campus? <br className="hidden sm:inline" />
            <span className="text-blue-300">Recover It with Trusted Verification.</span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto font-normal">
            No more unsearchable WhatsApp chats or disorganized noticeboards. Search campus listings, protect identifying details, and coordinate safe in-app handovers.
          </p>

          {/* Search Box */}
          <div className="max-w-2xl mx-auto mt-8">
            <form
              onSubmit={handleSearchSubmit}
              className="relative flex items-center bg-white rounded-2xl shadow-xl overflow-hidden p-1.5 focus-within:ring-2 focus-within:ring-blue-400"
            >
              <div className="pl-4 text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search lost AirPods, student ID, keys, blue backpack..."
                className="w-full px-4 py-3 text-slate-900 placeholder-slate-400 text-sm focus:outline-none"
              />
              <button
                type="submit"
                className="bg-campus-800 hover:bg-campus-950 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-colors flex items-center space-x-1.5 flex-shrink-0"
              >
                <span>Search</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/report/lost"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-md transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>I Lost an Item</span>
            </Link>

            <Link
              href="/report/found"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>I Found an Item</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Category Shortcuts */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Explore by Category</h2>
            <p className="text-xs text-slate-500 mt-0.5">Quickly browse belongings categorized across campus</p>
          </div>
          <Link
            href="/items"
            className="text-xs font-semibold text-campus-700 hover:text-campus-900 flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {CAMPUS_CONFIG.categories.slice(0, 6).map((cat) => (
            <Link
              key={cat.id}
              href={`/items?category=${encodeURIComponent(cat.id)}`}
              className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-campus-300 hover:shadow-sm transition-all flex flex-col items-center text-center group"
            >
              <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                {getCategoryIcon(cat.icon)}
              </div>
              <span className="text-xs font-semibold text-slate-800 line-clamp-1">{cat.id}</span>
              <span className="text-[10px] text-slate-400 mt-0.5">Browse items</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Recently Reported Items */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Recently Reported on Campus</h2>
            <p className="text-xs text-slate-500 mt-0.5">Live updates from libraries, classrooms, and cafeterias</p>
          </div>
          <Link
            href="/items"
            className="text-xs font-semibold text-campus-700 hover:text-campus-900 flex items-center space-x-1"
          >
            <span>See all {stats.active} items</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-72 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : recentReports.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentReports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-8">
            <Clock className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <h3 className="text-base font-semibold text-slate-800">No active reports yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Be the first to report a lost or found possession on your campus.
            </p>
            <div className="mt-4 flex justify-center gap-3">
              <Link
                href="/report/lost"
                className="text-xs font-semibold bg-campus-800 text-white px-4 py-2 rounded-lg"
              >
                Report Lost Item
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* How it Works: Security & Anti-Fraud Verification */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-campus-50 rounded-2xl border border-campus-100 p-8 sm:p-12">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-campus-900">
              How Safe Ownership Verification Works
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Our three-step verification protocol protects students from fraudulent claims and unauthorized possession handovers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-campus-800 text-white flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900">Report & Mask Details</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Finders post item photos while hiding confidential distinguishing traits (lock screen wallpaper, sticker placement, inside engravings).
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-campus-800 text-white flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900">Encrypted Verification</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Claimants answer private verification questions. Expected answers are evaluated securely with cryptographic hashing to stop guessing.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-campus-800 text-white flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900">Campus In-App Handover</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Once approved, both parties coordinate a handover at designated campus security desks without disclosing private personal phone numbers.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
