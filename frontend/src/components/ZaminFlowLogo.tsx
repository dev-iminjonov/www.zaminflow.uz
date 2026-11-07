"use client";

import React from "react";

export interface ZaminFlowLogoProps {
  mode?: "dark" | "light" | "auto";
  className?: string;
  size?: "xs" | "sm" | "md" | "lg";
  iconOnly?: boolean;
}

export default function ZaminFlowLogo({
  mode = "auto",
  className = "",
  size = "md",
  iconOnly = false,
}: ZaminFlowLogoProps) {
  // Dimensions calibrated to official 590x140 aspect ratio (~4.21:1)
  const dimensions = {
    xs: { width: 95, height: 22, imgClass: "h-6 w-auto", iconSize: 24 },
    sm: { width: 118, height: 28, imgClass: "h-7 w-auto", iconSize: 28 },
    md: { width: 152, height: 36, imgClass: "h-8 sm:h-9 w-auto", iconSize: 36 },
    lg: { width: 185, height: 44, imgClass: "h-10 sm:h-11 w-auto", iconSize: 44 },
  };

  const dim = dimensions[size] || dimensions.md;

  if (iconOnly) {
    return (
      <div className={`inline-flex items-center select-none ${className}`}>
        <img
          src="/images/zaminflow-icon.png"
          alt="ZaminFlow Icon"
          width={dim.iconSize}
          height={dim.iconSize}
          className="w-auto object-contain transition-transform duration-200 hover:scale-105"
          style={{ height: `${dim.iconSize}px` }}
        />
      </div>
    );
  }

  if (mode === "dark") {
    return (
      <div className={`inline-flex items-center select-none ${className}`}>
        <img
          src="/images/zaminflow-logo-dark.png"
          alt="ZaminFlow"
          width={dim.width}
          height={dim.height}
          className={`${dim.imgClass} object-contain transition-transform duration-200 hover:scale-[1.02]`}
          style={{ imageRendering: "auto" }}
        />
      </div>
    );
  }

  if (mode === "light") {
    return (
      <div className={`inline-flex items-center select-none ${className}`}>
        <img
          src="/images/zaminflow-logo-light.png"
          alt="ZaminFlow"
          width={dim.width}
          height={dim.height}
          className={`${dim.imgClass} object-contain transition-transform duration-200 hover:scale-[1.02]`}
          style={{ imageRendering: "auto" }}
        />
      </div>
    );
  }

  // mode === "auto": Responsive to Tailwind dark mode class
  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <img
        src="/images/zaminflow-logo-light.png"
        alt="ZaminFlow"
        width={dim.width}
        height={dim.height}
        className={`${dim.imgClass} dark:hidden object-contain transition-transform duration-200 hover:scale-[1.02]`}
        style={{ imageRendering: "auto" }}
      />
      <img
        src="/images/zaminflow-logo-dark.png"
        alt="ZaminFlow"
        width={dim.width}
        height={dim.height}
        className={`${dim.imgClass} hidden dark:block object-contain transition-transform duration-200 hover:scale-[1.02]`}
        style={{ imageRendering: "auto" }}
      />
    </div>
  );
}
