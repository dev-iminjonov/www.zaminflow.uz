import UserProfileView from "@/components/profile/UserProfileView";

export const metadata = {
  title: "Partner Trading Dossier | ZaminFlow",
  description: "B2B counterparty verification, milk quality benchmarks, and bank escrow credentials.",
};

export default async function PartnerDossierPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <UserProfileView profileId={id} />;
}
