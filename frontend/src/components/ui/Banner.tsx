import React from "react";

interface BannerProps {
  type: "info" | "success" | "warning" | "danger";
  title?: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export default function Banner({
  type = "info",
  title,
  message,
  actionText,
  onAction,
  className = "",
}: BannerProps) {
  const styles = {
    info: {
      bg: "bg-teal-50",
      border: "border-teal-200",
      text: "text-teal-900",
      icon: "ℹ️",
      action: "text-teal-700 hover:text-teal-900",
    },
    success: {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      text: "text-emerald-900",
      icon: "✓",
      action: "text-emerald-700 hover:text-emerald-900",
    },
    warning: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-900",
      icon: "⚠️",
      action: "text-amber-700 hover:text-amber-900",
    },
    danger: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-900",
      icon: "✕",
      action: "text-red-700 hover:text-red-900",
    },
  }[type];

  return (
    <div
      className={`rounded-xl border p-3.5 flex items-start justify-between gap-3 text-xs ${styles.bg} ${styles.border} ${styles.text} ${className}`}
    >
      <div className="flex items-start gap-2.5">
        <span className="font-bold text-sm leading-none mt-0.5">{styles.icon}</span>
        <div>
          {title && <span className="font-bold block text-xs">{title}</span>}
          <span className="font-normal leading-relaxed">{message}</span>
        </div>
      </div>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className={`font-bold underline text-xs whitespace-nowrap cursor-pointer ${styles.action}`}
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
