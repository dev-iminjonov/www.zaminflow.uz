import React from "react";

interface SubBar {
  label: string;
  weight: number;
  score: number;
}

interface TrustScoreGaugeProps {
  score: number; // 0 to 100
  showSubBars?: boolean;
  className?: string;
}

export default function TrustScoreGauge({
  score = 96,
  showSubBars = true,
  className = "",
}: TrustScoreGaugeProps) {
  const radius = 58;
  const stroke = 10;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let bandColor = "#059669"; // emerald
  let bandText = "EXCELLENT";
  if (score < 60) {
    bandColor = "#EF4444"; // red
    bandText = "AT RISK";
  } else if (score < 75) {
    bandColor = "#D97706"; // amber
    bandText = "SATISFACTORY";
  } else if (score < 90) {
    bandColor = "#0D7377"; // teal
    bandText = "GOOD";
  }

  const subBars: SubBar[] = [
    { label: "Quality Consistency", weight: 35, score: 98 },
    { label: "Volume Accuracy", weight: 30, score: 95 },
    { label: "Punctuality", weight: 25, score: 94 },
    { label: "Clean Dispute History", weight: 10, score: 100 },
  ];

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* 140px SVG Ring Gauge */}
      <div className="relative w-[140px] h-[140px] flex items-center justify-center">
        <svg height="140" width="140" className="transform -rotate-90">
          <circle
            stroke="#E2E8F0"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx="70"
            cy="70"
          />
          <circle
            stroke={bandColor}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx="70"
            cy="70"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-mono text-3xl font-black text-slate-900 tracking-tight">
            {score}
          </span>
          <span className="text-[9px] font-bold tracking-wider text-slate-500 uppercase mt-0.5">
            {bandText} / 100
          </span>
        </div>
      </div>

      {/* 4 Sub-Bars */}
      {showSubBars && (
        <div className="w-full mt-4 space-y-2 max-w-xs">
          {subBars.map((bar) => (
            <div key={bar.label} className="text-xs">
              <div className="flex justify-between items-center text-[11px] mb-1">
                <span className="text-slate-600 font-medium">
                  {bar.label} <span className="text-slate-400">({bar.weight}%)</span>
                </span>
                <span className="font-mono font-bold text-slate-800">{bar.score}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-emerald-600 h-1.5 rounded-full"
                  style={{ width: `${bar.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
