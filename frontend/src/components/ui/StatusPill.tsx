import React from "react";

export type StatusType =
  | "INCOMPLETE"
  | "SUBMITTED"
  | "VERIFIED"
  | "REJECTED"
  | "SUSPENDED"
  | "DRAFT"
  | "AWAITING_BANK_LOCK"
  | "ACTIVE_FUNDED"
  | "COMPLETED"
  | "IN_TRANSIT"
  | "EN_ROUTE"
  | "AT_GATE"
  | "SETTLED"
  | "DISPUTE_FROZEN"
  | string;

interface StatusPillProps {
  status: StatusType;
  label?: string;
  className?: string;
}

export default function StatusPill({ status, label, className = "" }: StatusPillProps) {
  const norm = (status || "").toUpperCase();

  const config: Record<string, { bg: string; text: string; border: string }> = {
    INCOMPLETE: { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200" },
    DRAFT: { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200" },
    SUBMITTED: { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200" },
    AWAITING_BANK_LOCK: { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200" },
    DISPUTE_FROZEN: { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200" },
    VERIFIED: { bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-200" },
    ACTIVE_FUNDED: { bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-200" },
    SETTLED: { bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-200" },
    COMPLETED: { bg: "bg-teal-50", text: "text-teal-800", border: "border-teal-200" },
    IN_TRANSIT: { bg: "bg-teal-50", text: "text-teal-800", border: "border-teal-200" },
    EN_ROUTE: { bg: "bg-teal-50", text: "text-teal-800", border: "border-teal-200" },
    AT_GATE: { bg: "bg-slate-100", text: "text-slate-800", border: "border-slate-300" },
    REJECTED: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
    SUSPENDED: { bg: "bg-slate-800", text: "text-slate-100", border: "border-slate-700" },
  };

  const style = config[norm] || {
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-200",
  };

  const displayLabel = label || norm.replace(/_/g, " ");

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-wider font-bold border ${style.bg} ${style.text} ${style.border} ${className}`}
    >
      {displayLabel}
    </span>
  );
}
