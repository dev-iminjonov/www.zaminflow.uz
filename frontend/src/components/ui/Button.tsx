"use client";

import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "glass";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  iconLeft,
  iconRight,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const sizeStyles = {
    sm: "h-9 px-3.5 text-xs rounded-[10px]",
    md: "h-11 px-5 text-sm rounded-[10px]",
    lg: "h-[52px] px-7 text-base rounded-[10px]",
  }[size];

  const variantStyles = {
    // WCAG AA compliant: #047857 has 5.5:1 contrast against white
    primary:
      "bg-[#047857] hover:bg-[#065F46] text-white font-semibold shadow-xs transition active:scale-[0.98] disabled:opacity-50",
    secondary:
      "bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-semibold shadow-xs transition active:scale-[0.98] disabled:opacity-50",
    ghost:
      "bg-transparent hover:bg-slate-100 text-slate-700 font-medium transition active:scale-[0.98] disabled:opacity-50",
    danger:
      "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-semibold transition active:scale-[0.98] disabled:opacity-50",
    glass:
      "bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/[0.14] backdrop-blur-md font-semibold transition active:scale-[0.98] disabled:opacity-50",
  }[variant];

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 select-none cursor-pointer disabled:cursor-not-allowed ${sizeStyles} ${variantStyles} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        iconLeft
      )}
      <span>{children}</span>
      {!loading && iconRight}
    </button>
  );
}
