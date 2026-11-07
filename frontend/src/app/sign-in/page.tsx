import { Suspense } from "react";
import SignInCard from "@/components/auth/SignInCard";

export const metadata = {
  title: "Sign in | ZaminFlow",
  description: "Sign in to your ZaminFlow B2B dairy supply platform account.",
};

export default function SignInAliasPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f6f9f8] animate-pulse" />}>
      <SignInCard />
    </Suspense>
  );
}
