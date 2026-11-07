import { Suspense } from "react";
import SignUpCard from "@/components/auth/SignUpCard";

export const metadata = {
  title: "Create your account | ZaminFlow",
  description: "Join ZaminFlow: B2B dairy supply platform connecting farmers with commercial processors.",
};

export default function SignUpAliasPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f6f9f8] animate-pulse" />}>
      <SignUpCard />
    </Suspense>
  );
}
