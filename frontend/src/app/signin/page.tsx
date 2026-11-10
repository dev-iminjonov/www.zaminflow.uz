import { Suspense } from "react";
import SlidingAuthCard from "@/components/auth/SlidingAuthCard";

export const metadata = {
  title: "Sign in | ZaminFlow",
  description: "Sign in to your ZaminFlow B2B dairy supply platform account.",
};

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#070B14] flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-[#00d3e0] border-t-transparent animate-spin" /></div>}>
      <SlidingAuthCard initialMode="signin" />
    </Suspense>
  );
}
