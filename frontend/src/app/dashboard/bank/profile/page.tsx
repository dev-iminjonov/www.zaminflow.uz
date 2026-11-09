import UserProfileView from "@/components/profile/UserProfileView";

export const metadata = {
  title: "Bank Custodian Profile | ZaminFlow",
  description: "AgroBank Custodian officer profile, CBU clearance, and double-entry authorization levels.",
};

export default function BankProfilePage() {
  return <UserProfileView initialRole="bank" />;
}
