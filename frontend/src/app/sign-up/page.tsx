import { Suspense } from "react";
import SlidingAuthCard from "@/components/auth/SlidingAuthCard";

export const metadata = {
  title: "Create your account | ZaminFlow",
  description: "Join ZaminFlow: B2B dairy supply platform connecting farmers with commercial processors.",
};

export default function SignUpAliasPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#070B14] flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-[#00d3e0] border-t-transparent animate-spin" /></div>}>
      <SlidingAuthCard initialMode="signup" />
    </Suspense>
  );
}
