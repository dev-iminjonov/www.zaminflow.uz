"use client";

import React from "react";
import { UserStatus } from "@/lib/services/users/userTypes";
import { useTheme } from "@/context/ThemeContext";

interface UserStatusBadgeProps {
  status: UserStatus;
  className?: string;
}

export default function UserStatusBadge({ status, className = "" }: UserStatusBadgeProps) {
  const { isDark } = useTheme();

  const configs: Record<UserStatus, { label: string; lightBg: string; lightText: string; darkBg: string; darkText: string }> = {
    active: {
      label: "Activated",
      lightBg: "bg-[#D7FCDA]",
      lightText: "text-[#137333]",
      darkBg: "bg-emerald-500/15",
      darkText: "text-[#00ffc8]",
    },
    muted: {
      label: "Mute",
      lightBg: "bg-[#F9D9DE]",
      lightText: "text-[#C5221F]",
      darkBg: "bg-rose-500/15",
      darkText: "text-rose-400",
    },
    deactivated: {
      label: "Deactivated",
      lightBg: "bg-[#EAECEF]",
      lightText: "text-[#5F6368]",
      darkBg: "bg-white/10",
      darkText: "text-gray-400",
    },
  };

  const config = configs[status] || configs.active;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-tight ${
        isDark ? `${config.darkBg} ${config.darkText}` : `${config.lightBg} ${config.lightText}`
      } ${className}`}
      role="status"
      aria-label={`Status: ${config.label}`}
    >
      {config.label}
    </span>
  );
}
