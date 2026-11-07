import React from "react";

interface KpiCardProps {
  eyebrow: string;
  figure: string;
  context?: string;
  delta?: string | { value: string; positive?: boolean };
  deltaPositive?: boolean;
  progressPct?: number;
  progress?: number;
  className?: string;
}

export default function KpiCard({
  eyebrow,
  figure,
  context,
  delta,
  deltaPositive = true,
  progressPct,
  progress,
  className = "",
}: KpiCardProps) {
  const deltaText = typeof delta === "object" ? delta.value : delta;
  const isPositive = typeof delta === "object" && delta.positive !== undefined ? delta.positive : deltaPositive;
  const activeProgress = progressPct !== undefined ? progressPct : progress;
  return (
    <div className={`bg-white rounded-[14px] border border-slate-200 p-5 shadow-xs flex flex-col justify-between ${className}`}>
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-teal-700 font-bold">
            {eyebrow}
          </span>
          {deltaText && (
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                isPositive
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {deltaText}
            </span>
          )}
        </div>
        <div className="font-mono text-2xl font-black text-slate-900 tracking-tight mt-1">
          {figure}
        </div>
      </div>

      {activeProgress !== undefined && (
        <div className="mt-3">
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-600 h-1.5 rounded-full"
              style={{ width: `${Math.min(100, Math.max(0, activeProgress))}%` }}
            />
          </div>
        </div>
      )}

      {context && (
        <div className="text-xs text-slate-500 mt-2 font-medium">
          {context}
        </div>
      )}
    </div>
  );
}
