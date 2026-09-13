import { cn } from "../../utils/cn";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusColor = (s: string) => {
    switch (s.toUpperCase()) {
      case "AVAILABLE":
      case "ACTIVE":
      case "COMPLETED":
      case "RESOLVED":
        return "bg-emerald-100 text-emerald-700 border-emerald-200 ";
      
      case "ASSIGNED":
      case "REPORTED":
      case "PENDING_ACCEPTANCE":
        return "bg-amber-100 text-amber-700 border-amber-200 ";
        
      case "UNDER_MAINTENANCE":
      case "IN_PROGRESS":
      case "UNDER_REVIEW":
        return "bg-indigo-100 text-indigo-700 border-indigo-200 ";
        
      case "RETIRED":
      case "INACTIVE":
      case "RESOLVED_RETIRED":
      case "RESOLVED_REPLACED":
      case "CANCELLED":
        return "bg-slate-100 text-slate-700 border-slate-200 ";
        
      case "REJECTED":
      case "NOT_REPAIRABLE":
        return "bg-rose-100 text-rose-700 border-rose-200 ";
        
      default:
        return "bg-slate-100 text-slate-700 border-slate-200 ";
    }
  };

  const formatLabel = (s: string) => {
    return s.replace(/_/g, " ").replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  };

  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium border", getStatusColor(status), className)}>
      {formatLabel(status)}
    </span>
  );
}

