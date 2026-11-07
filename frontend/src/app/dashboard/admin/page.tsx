import AdminOverview from "@/components/dashboard/AdminOverview";

export const metadata = {
  title: "Admin Dashboard | ZaminFlow",
  description: "Platform oversight, KYB verification queue, dispute arbitration, and market liquidity governance.",
};

export default function AdminDashboardPage() {
  return <AdminOverview />;
}
