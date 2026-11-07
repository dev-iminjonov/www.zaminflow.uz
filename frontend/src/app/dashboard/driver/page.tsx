import DriverOverview from "@/components/dashboard/DriverOverview";

export const metadata = {
  title: "Driver Dashboard | ZaminFlow",
  description: "Milk tanker dispatch, pickup routes, and cold chain temperature monitoring for logistics drivers.",
};

export default function DriverDashboardPage() {
  return <DriverOverview />;
}
