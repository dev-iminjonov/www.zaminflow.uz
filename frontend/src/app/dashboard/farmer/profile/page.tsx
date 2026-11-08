import UserProfileView from "@/components/profile/UserProfileView";

export const metadata = {
  title: "Farmer Trading Profile | ZaminFlow",
  description: "Dairy farm specifications, herd capacity, milk quality titration, and escrow track record.",
};

export default function FarmerProfilePage() {
  return <UserProfileView initialRole="farmer" />;
}
