import UserProfileView from "@/components/profile/UserProfileView";

export const metadata = {
  title: "Dairy Partner Profile | ZaminFlow",
  description: "Trading partner profile, milk processing capacity, and escrow credentials on ZaminFlow.",
};

export default function DairyProfilePage() {
  return <UserProfileView initialRole="dairy" />;
}
