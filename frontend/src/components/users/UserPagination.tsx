"use client";

import React from "react";
import { useTheme } from "@/context/ThemeContext";

interface UserPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function UserPagination({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}: UserPaginationProps) {
  const { isDark } = useTheme();

  if (totalPages <= 1) return null;

  // Generate page list with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push(2);

      if (currentPage > 4) {
        pages.push("...");
      }

      const start = Math.max(3, currentPage - 1);
      const end = Math.min(totalPages - 2, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (currentPage < totalPages - 3) {
        pages.push("....");
      }

      if (!pages.includes(totalPages - 1)) pages.push(totalPages - 1);
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
  };

  return (
    <nav
      className={`flex items-center justify-center gap-2 py-6 select-none ${className}`}
      aria-label="Pagination"
    >
      {/* Previous Arrow */}
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold transition cursor-pointer disabled:opacity-20 disabled:pointer-events-none ${
          isDark
            ? "border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"
            : "border border-[#ade8f4] text-[#03045e] hover:bg-[#ade8f4]/30"
        }`}
        aria-label="Previous page"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1.5">
        {getPageNumbers().map((page, idx) => {
          if (typeof page === "string") {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="w-7 h-7 flex items-center justify-center text-xs font-black text-gray-400 select-none"
              >
                …
              </span>
            );
          }

          const isCurrent = page === currentPage;
          return (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              aria-current={isCurrent ? "page" : undefined}
              className={`w-8 h-8 flex items-center justify-center rounded-xl text-xs font-black transition cursor-pointer ${
                isCurrent
                  ? "bg-gradient-to-r from-[#00ffc8] via-[#00d3e0] to-[#0099ff] text-[#070B14] shadow-md scale-105"
                  : isDark
                  ? "text-gray-300 hover:text-white hover:bg-white/10"
                  : "text-[#03045e] hover:bg-[#ade8f4]/30"
              }`}
            >
              {page}
            </button>
          );
        })}
      </div>

      {/* Next Arrow */}
      <button
        type="button"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold transition cursor-pointer disabled:opacity-20 disabled:pointer-events-none ${
          isDark
            ? "border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"
            : "border border-[#ade8f4] text-[#03045e] hover:bg-[#ade8f4]/30"
        }`}
        aria-label="Next page"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </nav>
  );
}
