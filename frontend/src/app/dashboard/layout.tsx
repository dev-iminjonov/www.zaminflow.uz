import React from "react";
import RoleDashboardShell from "@/components/dashboard/RoleDashboardShell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleDashboardShell>{children}</RoleDashboardShell>;
}
