import FarmerOverview from "@/components/dashboard/FarmerOverview";

export const metadata = {
  title: "Farmer Dashboard | ZaminFlow",
  description: "Raw milk supply, farm-gate pricing, and escrow settlements for farmers and cooperatives.",
};

export default function FarmerDashboardPage() {
  return <FarmerOverview />;
}
