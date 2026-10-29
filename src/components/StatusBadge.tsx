import React from "react";

interface StatusBadgeProps {
  status: string;
  type?: "report" | "claim";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = "report" }) => {
  const getBadgeStyle = () => {
    switch (status.toUpperCase()) {
      case "ACTIVE":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "PENDING":
      case "PENDING_VERIFICATION":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "UNDER_REVIEW":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "APPROVED":
      case "CLAIMED":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "RESOLVED":
      case "COMPLETED":
        return "bg-slate-100 text-slate-700 border-slate-300";
      case "REJECTED":
      case "CANCELLED":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "HIDDEN":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getLabel = () => {
    switch (status.toUpperCase()) {
      case "ACTIVE":
        return "Active Listing";
      case "PENDING":
        return "Pending Review";
      case "UNDER_REVIEW":
        return "Under Review";
      case "APPROVED":
        return "Claim Approved";
      case "CLAIMED":
        return "Claim Pending Handover";
      case "RESOLVED":
        return "Recovered & Resolved";
      case "COMPLETED":
        return "Handover Complete";
      case "REJECTED":
        return "Not Verified / Rejected";
      case "CANCELLED":
        return "Cancelled";
      case "HIDDEN":
        return "Moderated / Hidden";
      default:
        return status;
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getBadgeStyle()}`}
    >
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-75" />
      {getLabel()}
    </span>
  );
};
