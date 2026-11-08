import UserProfileView from "@/components/profile/UserProfileView";

export const metadata = {
  title: "Cold-Chain Logistics Profile | ZaminFlow",
  description: "Refrigerated milk transport fleet, telematics verification, and temperature compliance ratings.",
};

export default function DriverProfilePage() {
  return <UserProfileView initialRole="driver" />;
}
