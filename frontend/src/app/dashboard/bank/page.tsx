import React from "react";
import BankOverview from "@/components/dashboard/BankOverview";

export const metadata = {
  title: "Partner Bank Escrow & ISO 20022 Clearing | ZaminFlow",
  description:
    "Custodian bank portal for ZaminFlow smart escrow vaults, double-entry ledger auditing, and ISO 20022 pacs.008 clearing exports.",
};

export default function BankDashboardPage() {
  return <BankOverview />;
}
