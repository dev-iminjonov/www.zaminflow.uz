/**
 * Dashboard Shells KPI Telemetry Data Layer
 * 
 * Provides mock KPI cards and telemetry for each role shell:
 * - Farmer
 * - Dairy Industry
 * - Driver
 * - Admin
 */

import { RoleKey } from "./roles";

export interface DashboardKpiCard {
  label: string;
  value: string;
  unit?: string;
  delta?: string;
  deltaType?: "positive" | "neutral" | "warning";
  caption?: string;
}

export interface RoleDashboardData {
  role: RoleKey;
  roleBadge: string;
  title: string;
  description: string;
  kpis: DashboardKpiCard[];
}

export const ROLE_DASHBOARDS: Record<RoleKey, RoleDashboardData> = {
  farmer: {
    role: "farmer",
    roleBadge: "Farmer / Cooperative",
    title: "Raw Milk Supply & Escrow Overview",
    description: "Monitor farm-gate milk spot prices, laboratory quality titration results, and automated bank disbursements.",
    kpis: [
      {
        label: "Today's Milk Price",
        value: "4,380",
        unit: "UZS / L",
        delta: "+12.4%",
        deltaType: "positive",
        caption: "Quality-indexed spot rate",
      },
      {
        label: "Litres Supplied",
        value: "18,400",
        unit: "L",
        delta: "+3.8%",
        deltaType: "positive",
        caption: "Delivered this billing cycle",
      },
      {
        label: "Next Escrow Payout",
        value: "64,200,000",
        unit: "UZS",
        delta: "Auto-release",
        deltaType: "positive",
        caption: "Locked in partner bank escrow",
      },
      {
        label: "Quality Grade",
        value: "Grade A+",
        delta: "Fat 4.1% • SNF 8.7%",
        deltaType: "positive",
        caption: "Passed gate titration lab",
      },
    ],
  },
  dairy: {
    role: "dairy",
    roleBadge: "Dairy Industry / Buyer",
    title: "Commercial Procurement & Logistics Oversight",
    description: "Manage regional milk supply contracts, track inbound refrigerated tankers, and oversee bank escrow funding.",
    kpis: [
      {
        label: "Open Orders",
        value: "14",
        unit: "contracts",
        delta: "3 pending acceptance",
        deltaType: "neutral",
        caption: "Active supply agreements",
      },
      {
        label: "Litres Received",
        value: "142,600",
        unit: "L",
        delta: "+8.2%",
        deltaType: "positive",
        caption: "Total volume processed today",
      },
      {
        label: "Active Shipments",
        value: "6",
        unit: "trucks",
        delta: "+3.2°C Cold Chain",
        deltaType: "positive",
        caption: "In-transit GPS telemetry locked",
      },
      {
        label: "Escrow Balance",
        value: "385,000,000",
        unit: "UZS",
        delta: "Secured",
        deltaType: "positive",
        caption: "Prefunded in settlement account",
      },
    ],
  },
  driver: {
    role: "driver",
    roleBadge: "Certified Logistics Driver",
    title: "Refrigerated Fleet & Transport Dispatch",
    description: "Assigned farm-gate pickups, delivery route navigation, and live IoT cold-chain temperature monitoring.",
    kpis: [
      {
        label: "Today's Trips",
        value: "3",
        unit: "assigned",
        delta: "1 in transit",
        deltaType: "neutral",
        caption: "Scheduled route dispatches",
      },
      {
        label: "Next Pickup",
        value: "Baraka Farm",
        unit: "14:30",
        delta: "Sayxunobod region",
        deltaType: "positive",
        caption: "8,500 L batch allocation",
      },
      {
        label: "Cold-Chain Status",
        value: "+3.4°C",
        delta: "Optimal (2°– 4°C)",
        deltaType: "positive",
        caption: "Tanker telemetry sensor locked",
      },
      {
        label: "Completed Deliveries",
        value: "12",
        unit: "trips",
        delta: "100% on time",
        deltaType: "positive",
        caption: "Delivered safely this week",
      },
    ],
  },
  admin: {
    role: "admin",
    roleBadge: "Platform Operator / SuperAdmin",
    title: "System Administration & Risk Governance",
    description: "Enterprise oversight of KYB verification, dispute arbitration, market liquidity, and bank ledger settlements.",
    kpis: [
      {
        label: "Awaiting Verification",
        value: "8",
        unit: "orgs",
        delta: "Needs review",
        deltaType: "warning",
        caption: "Pending KYB compliance check",
      },
      {
        label: "Active Users Per Role",
        value: "1,240",
        unit: "users",
        delta: "+18 today",
        deltaType: "positive",
        caption: "Farmers, Dairies, Drivers",
      },
      {
        label: "Open Disputes",
        value: "0",
        unit: "active",
        delta: "Clean record",
        deltaType: "positive",
        caption: "Zero arbitrations pending",
      },
      {
        label: "Platform Escrow Total",
        value: "48,500,000",
        unit: "UZS",
        delta: "100% settled",
        deltaType: "positive",
        caption: "Under partner bank custody",
      },
    ],
  },
};

export function getDashboardDataForRole(roleKey: RoleKey): RoleDashboardData {
  return ROLE_DASHBOARDS[roleKey] || ROLE_DASHBOARDS.farmer;
}
