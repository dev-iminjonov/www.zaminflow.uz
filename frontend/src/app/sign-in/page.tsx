import { Suspense } from "react";
import SlidingAuthCard from "@/components/auth/SlidingAuthCard";

export const metadata = {
  title: "Sign in | ZaminFlow",
  description: "Sign in to your ZaminFlow B2B dairy supply platform account.",
};

export default function SignInAliasPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0d1013] animate-pulse" />}>
      <SlidingAuthCard initialMode="signin" />
    </Suspense>
  );
}
