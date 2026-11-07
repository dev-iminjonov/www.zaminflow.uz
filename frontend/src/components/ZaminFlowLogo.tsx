"use client";

import React from "react";
import Image from "next/image";

interface ZaminFlowLogoProps {
  mode?: "dark" | "light";
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function ZaminFlowLogo({
  mode = "light",
  className = "",
  size = "md",
}: ZaminFlowLogoProps) {
  const isDark = mode === "dark";

  // Height mappings matching the exact aspect ratio of the uploaded logo (approx 4:1)
  const dimensions = {
    sm: { width: 120, height: 30 },
    md: { width: 146, height: 37 },
    lg: { width: 180, height: 46 },
  };

  const { width, height } = dimensions[size];

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      {/* Exact uploaded logo file */}
      <img
        src={isDark ? "/images/zaminflow-logo-dark.png" : "/images/zaminflow-logo-light.png"}
        alt="zaminflow"
        width={width}
        height={height}
        className="h-8 sm:h-9 w-auto object-contain transition-transform duration-200 hover:scale-[1.02]"
        style={{ imageRendering: "auto" }}
      />
    </div>
  );
}
