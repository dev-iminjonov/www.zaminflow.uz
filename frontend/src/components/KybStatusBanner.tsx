"use client";

import React from "react";
import Link from "next/link";

interface KybStatusBannerProps {
  status: "INCOMPLETE" | "SUBMITTED" | "VERIFIED" | "REJECTED" | "SUSPENDED" | string;
  reviewNote?: string | null;
  profilePath?: string;
}

export default function KybStatusBanner({ status, reviewNote, profilePath = "/farmer/profile" }: KybStatusBannerProps) {
  if (status === "VERIFIED") {
    return null;
  }

  if (status === "INCOMPLETE") {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-3 w-3 rounded-full bg-amber-500 animate-pulse" />
          <div>
            <div className="font-semibold text-sm">Action Required: Profile Incomplete</div>
            <div className="text-xs text-amber-700">Fill in all required fields and upload documents to submit for Admin verification.</div>
          </div>
        </div>
        <Link
          href={profilePath}
          className="rounded-lg bg-amber-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow hover:bg-amber-700 transition"
        >
          Complete Profile
        </Link>
      </div>
    );
  }

  if (status === "SUBMITTED") {
    return (
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-900 shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-3 w-3 rounded-full bg-blue-500" />
          <div>
            <div className="font-semibold text-sm">Verification Under Review</div>
            <div className="text-xs text-blue-700">Your organization submission is queued for compliance verification. Feature access unlocks once approved.</div>
          </div>
        </div>
        <Link
          href={profilePath}
          className="rounded-lg border border-blue-300 bg-white px-3 py-1.5 text-xs font-medium text-blue-800 hover:bg-blue-50 transition"
        >
          View Profile
        </Link>
      </div>
    );
  }

  if (status === "REJECTED") {
    return (
      <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-900 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 rounded-full bg-red-600" />
            <span className="font-bold text-sm">Submission Rejected by Compliance</span>
          </div>
          <Link
            href={profilePath}
            className="rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition"
          >
            Edit & Resubmit
          </Link>
        </div>
        {reviewNote && (
          <div className="rounded-lg bg-white p-3 border border-red-200 text-xs text-red-800 font-mono">
            Reason: {reviewNote}
          </div>
        )}
      </div>
    );
  }

  if (status === "SUSPENDED") {
    return (
      <div className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-rose-900 shadow-sm space-y-1">
        <div className="font-bold text-sm">Organization Suspended</div>
        <div className="text-xs text-rose-700">
          Account functions are restricted. Please contact compliance support at support@zaminflow.uz.
        </div>
        {reviewNote && (
          <div className="text-xs font-mono text-rose-800 mt-1">Note: {reviewNote}</div>
        )}
      </div>
    );
  }

  return null;
}
