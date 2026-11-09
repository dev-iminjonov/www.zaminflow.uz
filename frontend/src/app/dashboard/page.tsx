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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0d1013] text-white select-none">
      <div className="w-10 h-10 rounded-full border-2 border-[#00ffc8]/30 border-t-[#00ffc8] animate-spin mb-4" />
      <div className="text-center font-bold text-xs uppercase tracking-widest text-[#00d3e0] animate-pulse">
        Directing to your workspace...
      </div>
    </div>
  );
}
