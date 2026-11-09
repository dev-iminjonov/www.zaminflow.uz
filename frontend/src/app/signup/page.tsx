import { Suspense } from "react";
import SlidingAuthCard from "@/components/auth/SlidingAuthCard";

export const metadata = {
  title: "Create your account | ZaminFlow",
  description: "Join ZaminFlow: B2B dairy supply platform connecting farmers with commercial processors.",
};

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#181818] animate-pulse" />}>
      <SlidingAuthCard initialMode="signup" />
    </Suspense>
  );
}
