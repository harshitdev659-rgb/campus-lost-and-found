"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  Filter,
  X,
  Calendar,
  MapPin,
  Tag,
  ArrowUpDown,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ReportCard, ReportItem } from "@/components/ReportCard";
import { CAMPUS_CONFIG } from "@/lib/campus-config";

function ItemsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL state
  const queryParam = searchParams.get("q") || "";
  const typeParam = searchParams.get("type") || "ALL";
  const categoryParam = searchParams.get("category") || "ALL";
  const locationParam = searchParams.get("campusLocation") || "ALL";
  const sortParam = searchParams.get("sort") || "newest";
  const pageParam = parseInt(searchParams.get("page") || "1", 10);

  // Local filter state
  const [q, setQ] = useState(queryParam);
  const [type, setType] = useState(typeParam);
  const [category, setCategory] = useState(categoryParam);
  const [campusLocation, setCampusLocation] = useState(locationParam);
  const [sort, setSort] = useState(sortParam);
  const [page, setPage] = useState(pageParam);

  const [reports, setReports] = useState<ReportItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    setQ(queryParam);
    setType(typeParam);
    setCategory(categoryParam);
    setCampusLocation(locationParam);
    setSort(sortParam);
    setPage(pageParam);
  }, [queryParam, typeParam, categoryParam, locationParam, sortParam, pageParam]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (type && type !== "ALL") params.set("type", type);
      if (category && category !== "ALL") params.set("category", category);
      if (campusLocation && campusLocation !== "ALL") params.set("campusLocation", campusLocation);
      if (sort) params.set("sort", sort);
      params.set("page", page.toString());
      params.set("limit", "12");

      const res = await fetch(`/api/reports?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalItems(data.pagination?.total || 0);
      }
    } catch (e) {
      console.error("Failed to load reports", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [q, type, category, campusLocation, sort, page]);

  const updateUrlParams = (newParams: Record<string, string | number>) => {
    const current = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([k, v]) => {
      if (!v || v === "ALL") {
        current.delete(k);
      } else {
        current.set(k, v.toString());
      }
    });
    router.push(`/items?${current.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrlParams({ q, page: 1 });
  };

  const clearAllFilters = () => {
    setQ("");
    setType("ALL");
    setCategory("ALL");
    setCampusLocation("ALL");
    setSort("newest");
    setPage(1);
    router.push("/items");
  };

  const hasActiveFilters =
    q || (type && type !== "ALL") || (category && category !== "ALL") || (campusLocation && campusLocation !== "ALL");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Browse Campus Listings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Discover lost or found personal belongings reported across university campus buildings.
          </p>
        </div>

        {/* Total Count Badge */}
        <div className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
          Showing <span className="font-semibold text-slate-900">{totalItems}</span> listings
        </div>
      </div>

      {/* Main Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
        {/* Search Row */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by keywords (e.g. calculator, silver watch, physics notebook)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-campus-700 focus:border-transparent"
            />
            {q && (
              <button
                type="button"
                onClick={() => {
                  setQ("");
                  updateUrlParams({ q: "", page: 1 });
                }}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-campus-800 text-white rounded-lg text-sm font-semibold hover:bg-campus-900 transition-colors"
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="sm:hidden px-3 py-2.5 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center"
          >
            <Filter className="w-4 h-4" />
          </button>
        </form>

        {/* Filter Selectors (Desktop) */}
        <div className={`grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 ${mobileFilterOpen ? "block" : "hidden sm:grid"}`}>
          {/* Type Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
              Listing Type
            </label>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                updateUrlParams({ type: e.target.value, page: 1 });
              }}
              className="w-full py-2 px-3 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:ring-1 focus:ring-campus-700"
            >
              <option value="ALL">All Listings (Lost & Found)</option>
              <option value="LOST">Lost Belongings</option>
              <option value="FOUND">Found Items</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                updateUrlParams({ category: e.target.value, page: 1 });
              }}
              className="w-full py-2 px-3 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:ring-1 focus:ring-campus-700"
            >
              <option value="ALL">All Categories</option>
              {CAMPUS_CONFIG.categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id}
                </option>
              ))}
            </select>
          </div>

          {/* Campus Location Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
              Campus Location
            </label>
            <select
              value={campusLocation}
              onChange={(e) => {
                setCampusLocation(e.target.value);
                updateUrlParams({ campusLocation: e.target.value, page: 1 });
              }}
              className="w-full py-2 px-3 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:ring-1 focus:ring-campus-700"
            >
              <option value="ALL">All Locations</option>
              {CAMPUS_CONFIG.locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
              Sort Order
            </label>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                updateUrlParams({ sort: e.target.value, page: 1 });
              }}
              className="w-full py-2 px-3 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:ring-1 focus:ring-campus-700"
            >
              <option value="newest">Recently Reported</option>
              <option value="oldest">Oldest First</option>
              <option value="event_recent">Recent Event Date</option>
            </select>
          </div>
        </div>

        {/* Active Filter Chips & Reset */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-400">Active filters:</span>
            {q && (
              <span className="inline-flex items-center text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                Keyword: "{q}"
              </span>
            )}
            {type !== "ALL" && (
              <span className="inline-flex items-center text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                Type: {type}
              </span>
            )}
            {category !== "ALL" && (
              <span className="inline-flex items-center text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                Category: {category}
              </span>
            )}
            {campusLocation !== "ALL" && (
              <span className="inline-flex items-center text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                Location: {campusLocation}
              </span>
            )}

            <button
              onClick={clearAllFilters}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold ml-auto flex items-center space-x-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Clear All</span>
            </button>
          </div>
        )}
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-72 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : reports.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200 p-8 space-y-3">
          <Search className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-semibold text-slate-800">No listings match your search</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your category or campus location filter, or check back later as students submit new reports daily.
          </p>
          <button
            onClick={clearAllFilters}
            className="text-xs font-semibold px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 pt-6">
          <button
            disabled={page <= 1}
            onClick={() => updateUrlParams({ page: page - 1 })}
            className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs font-medium text-slate-600 px-3">
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page >= totalPages}
            onClick={() => updateUrlParams({ page: page + 1 })}
            className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function ItemsPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto p-8">Loading listings...</div>}>
      <ItemsContent />
    </Suspense>
  );
}
