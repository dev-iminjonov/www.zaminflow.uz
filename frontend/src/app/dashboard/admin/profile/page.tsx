import UserProfileView from "@/components/profile/UserProfileView";

export const metadata = {
  title: "Platform Administration Profile | ZaminFlow",
  description: "National dairy infrastructure operations, escrow reserve oversight, and dispute arbitration.",
};

export default function AdminProfilePage() {
  return <UserProfileView initialRole="admin" />;
}
