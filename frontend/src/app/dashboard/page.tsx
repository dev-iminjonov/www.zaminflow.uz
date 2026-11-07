"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredSession } from "@/lib/auth";

export default function DashboardRootRedirect() {
  const router = useRouter();

  useEffect(() => {
    const session = getStoredSession();
    if (session?.dashboardPath) {
      router.replace(session.dashboardPath);
    } else {
      router.replace("/dashboard/farmer");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[linear-gradient(160deg,#f6f9f8_0%,#e4f6ec_100%)]">
      <div className="text-center font-medium text-sm text-[#4d6a60] animate-pulse">
        Directing to your workspace...
      </div>
    </div>
  );
}
