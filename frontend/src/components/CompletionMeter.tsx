"use client";

import React from "react";
import Link from "next/link";

interface CompletionMeterProps {
  percent: number;
  missing: string[];
  profilePath?: string;
}

const FIELD_LABELS: Record<string, string> = {
  tax_id: "Tax ID (STIR / INN 9 digits)",
  contact_phone: "Contact phone (+998)",
  location: "GPS Map Pin (inside Uzbekistan)",
  bank_iban: "Bank Account / IBAN",
  cattle_headcount: "Cattle Headcount (≥ 1)",
  daily_capacity_liters: "Daily Milk Capacity (Liters)",
  cooling_tank_capacity_liters: "Cooling Tank Capacity (Liters)",
  registration_or_tax_cert: "State Registration or Tax Certificate",
  vet_cert: "Veterinary Safety Certificate",
  signatory_name: "Authorized Signatory Name",
  daily_intake: "Daily Intake Requirement (Liters)",
  intake_hours: "Intake Operating Hours",
  quality_matrix: "Quality Matrix Confirmation",
  registration_cert: "State Registration Certificate",
  sanitary_permit: "Sanitary / Operating Permit",
  address_text: "Physical Address",
  contact_person: "Contact Person",
  license_number: "Banking License Number",
  settlement_account: "Settlement Account",
  webhook_url: "Partner Bank Webhook URL",
  bank_license_doc: "Banking License Document",
};

export default function CompletionMeter({ percent, missing, profilePath = "/farmer/profile" }: CompletionMeterProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Profile Readiness Checklist
        </span>
        <span className="font-mono text-sm font-bold text-slate-900">{percent}% Complete</span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden mb-4">
        <div
          className={`h-full transition-all duration-500 ${
            percent === 100 ? "bg-emerald-500" : percent >= 60 ? "bg-cyan-500" : "bg-amber-500"
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>

      {missing.length > 0 ? (
        <div className="space-y-2">
          <div className="text-xs font-medium text-slate-700">Missing required items:</div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {missing.map((item) => (
              <li key={item} className="flex items-center gap-2 text-slate-600">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                <Link href={`${profilePath}#${item}`} className="hover:text-cyan-700 underline decoration-slate-300">
                  {FIELD_LABELS[item] || item}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl">
          <span>✓</span>
          <span>All required checklist fields filled. Ready to submit for Admin review.</span>
        </div>
      )}
    </div>
  );
}
