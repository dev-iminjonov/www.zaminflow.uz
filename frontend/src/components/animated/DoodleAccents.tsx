"use client";

import React from "react";

/**
 * Hand-drawn animated underline under highlighted text.
 * Uses SVG stroke-dasharray/stroke-dashoffset to draw on view.
 */
export function HandDrawnUnderline({
  className = "",
  color = "#00d3e0",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <span className={`relative inline-block ${className}`}>
      <svg
        className="absolute -bottom-2 left-0 w-full h-3 overflow-visible pointer-events-none"
        viewBox="0 0 240 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <path
          d="M3 11C45 4 110 3 237 8C175 14 70 15 15 13"
          stroke={color}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-draw-line"
        />
      </svg>
    </span>
  );
}

/**
 * Hand-drawn 3-stroke splash doodle (top-right of headline or H2)
 */
export function SplashDoodle({
  className = "",
  color = "#00d3e0",
  size = 32,
}: {
  className?: string;
  color?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block pointer-events-none ${className}`}
    >
      <path
        d="M18 4V10"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M29 9L24 14"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M33 22H27"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Thin curvy connector line looping between sections
 */
export function CurvedConnectorLine({
  className = "",
  variant = "loop",
}: {
  className?: string;
  variant?: "loop" | "wave" | "s-curve";
}) {
  return (
    <div className={`w-full overflow-hidden pointer-events-none ${className}`}>
      <svg
        className="w-full h-16 sm:h-24 opacity-40 dark:opacity-25"
        viewBox="0 0 1200 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        {variant === "loop" && (
          <path
            d="M0,50 C300,10 400,90 600,50 C800,10 900,90 1200,50"
            stroke="url(#turquoise-line-grad)"
            strokeWidth="2"
            strokeDasharray="6 6"
            strokeLinecap="round"
          />
        )}
        {variant === "wave" && (
          <path
            d="M0,30 C350,90 650,10 1200,60"
            stroke="url(#turquoise-line-grad)"
            strokeWidth="2"
            strokeDasharray="4 4"
            strokeLinecap="round"
          />
        )}
        {variant === "s-curve" && (
          <path
            d="M0,80 C400,10 700,90 1200,20"
            stroke="url(#turquoise-line-grad)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        )}
        <defs>
          <linearGradient id="turquoise-line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00ffc8" />
            <stop offset="50%" stopColor="#00d3e0" />
            <stop offset="100%" stopColor="#0099ff" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
