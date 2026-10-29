import React from "react";
import Link from "next/link";
import {
  MapPin,
  Calendar,
  ShieldCheck,
  HelpCircle,
  Eye,
  Tag,
  Building,
} from "lucide-react";
import { StatusBadge } from "./StatusBadge";

export interface ReportItem {
  id: string;
  type: "LOST" | "FOUND";
  title: string;
  description: string;
  category: string;
  dateEvent: string;
  campusLocation: string;
  building?: string | null;
  room?: string | null;
  imageUrl?: string | null;
  status: string;
  hasDistinguishingFeatures?: boolean;
  user?: {
    name: string;
    collegeDomain: string;
  };
  _count?: {
    claims?: number;
    savedBy?: number;
  };
}

interface ReportCardProps {
  report: ReportItem;
}

export const ReportCard: React.FC<ReportCardProps> = ({ report }) => {
  const isFound = report.type === "FOUND";
  const formattedDate = new Date(report.dateEvent).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col h-full group">
      {/* Top Banner / Image */}
      <div className="relative h-48 bg-slate-100 overflow-hidden flex items-center justify-center">
        {report.imageUrl ? (
          <img
            src={report.imageUrl}
            alt={report.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400 p-4">
            <Tag className="w-10 h-10 mb-1 stroke-1" />
            <span className="text-xs font-medium text-slate-500">No Image Provided</span>
          </div>
        )}

        {/* Type Ribbon */}
        <div className="absolute top-3 left-3 flex items-center space-x-1.5">
          <span
            className={`px-2.5 py-1 rounded-md text-xs font-bold tracking-wide uppercase shadow-sm ${
              isFound
                ? "bg-emerald-600 text-white"
                : "bg-amber-600 text-white"
            }`}
          >
            {report.type}
          </span>
          <StatusBadge status={report.status} />
        </div>

        {/* Anti-Fraud Protection Tag */}
        {report.hasDistinguishingFeatures && (
          <div
            className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[10px] font-medium flex items-center space-x-1"
            title="Ownership proof required to claim"
          >
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Protected Details</span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-semibold text-campus-700 bg-campus-50 px-2 py-0.5 rounded">
              {report.category}
            </span>
            <div className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formattedDate}</span>
            </div>
          </div>

          <h3 className="text-base font-semibold text-slate-900 group-hover:text-campus-800 transition-colors line-clamp-1 mb-1">
            {report.title}
          </h3>

          <p className="text-xs text-slate-600 line-clamp-2 mb-3">
            {report.description}
          </p>
        </div>

        {/* Footer Meta & Action */}
        <div className="pt-3 border-t border-slate-100 space-y-2.5">
          <div className="flex items-center text-xs text-slate-600 space-x-1 truncate">
            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">{report.campusLocation}</span>
            {report.building && (
              <span className="text-slate-400">({report.building})</span>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-400">
              Reported by {report.user ? report.user.name.split(" ")[0] : "Student"}
            </span>

            <Link
              href={`/items/${report.id}`}
              className="inline-flex items-center space-x-1 text-xs font-semibold text-campus-800 hover:text-campus-900 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <span>{isFound ? "Verify & Claim" : "View Details"}</span>
              <Eye className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
