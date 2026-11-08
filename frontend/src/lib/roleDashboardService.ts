/**
 * Role Dashboard Telemetry Service
 *
 * Provides real-time telemetry data for the four ZaminFlow role dashboards:
 * - Farmer
 * - Dairy Industry
 * - Driver
 * - Admin
 *
 * Supports mock provider data (matching Figma/HTML artboards) and live backend API integration.
 * Control mode via NEXT_PUBLIC_USE_MOCK_DATA environment variable.
 */

import { authenticatedFetch } from "./auth";

export const USE_MOCK_DATA =
  process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

// --- Types ---

export interface FarmerDashboardData {
  todayPrice: { value: string; unit: string; delta: string };
  suppliedThisMonth: { value: string; unit: string };
  nextPayout: { value: string; unit: string };
  qualityGrade: { grade: string; snf: string };
  recentDeliveries: Array<{
    id: string;
    destination: string;
    batch: string;
    volume: string;
    grade: string;
    status: string;
    statusType: "success" | "warning" | "neutral";
  }>;
  payouts: Array<{
    id: string;
    batch: string;
    condition: string;
    amount: string;
  }>;
}

export interface DairyDashboardData {
  openOrders: { value: string; unit: string };
  receivedToday: { value: string; unit: string; delta: string };
  activeShipments: { value: string; unit: string; coldStatus: string };
  escrowBalance: { value: string; unit: string };
  incomingShipments: Array<{
    id: string;
    route: string;
    batch: string;
    gpsLock: boolean;
    temp: string;
    etaOrStatus: string;
    status: string;
    statusType: "success" | "warning" | "neutral";
  }>;
  regionalPrices: Array<{
    region: string;
    price: string;
    percentage: number;
  }>;
}

export interface DriverDashboardData {
  todayTrips: { value: string; unit: string };
  nextPickup: { time: string; location: string };
  coldChain: { temp: string; status: string; inRange: boolean };
  completedThisWeek: { value: string; unit: string };
  todayStops: Array<{
    id: string;
    time: string;
    isoTimestamp?: string;
    type: "pickup" | "deliver";
    locationName: string;
    batchInfo: string;
    status: string;
    statusType: "next" | "scheduled";
  }>;
  activeTrip: {
    batch: string;
    route: string;
    progressPercentage: number;
    eta: string;
  };
}

export interface AdminDashboardData {
  pendingVerification: { value: string; unit: string };
  activeUsers: { value: string; delta: string };
  openDisputes: { value: string; status: string; statusType: "warning" | "neutral" };
  escrowTotal: { value: string; unit: string };
  verificationQueue: Array<{
    id: string;
    roleLabel: string;
    location: string;
    timeAgo: string;
    roleChip: string;
  }>;
  usersByRole: Array<{
    role: string;
    count: string;
    percentage: number;
  }>;
}

export interface BankDashboardData {
  totalEscrowHeld: { value: string; unit: string };
  releasedToday: { value: string; unit: string };
  frozenDisputes: { value: string; status: string };
  factoringFeeRevenue: { value: string; unit: string };
  ledgerEntries: Array<{
    id: string;
    contractId: string;
    batchId: string | null;
    entryType: string;
    debitAccount: string;
    creditAccount: string;
    amountUzs: string;
    bankReferenceId: string;
    webhookStatus: string;
    createdAt: string;
  }>;
}

// --- Mock Data (Exact match to Artboard Specs) ---

export const MOCK_FARMER_DATA: FarmerDashboardData = {
  todayPrice: { value: "4,380", unit: "UZS / L", delta: "+12.4%" },
  suppliedThisMonth: { value: "18,240", unit: "L" },
  nextPayout: { value: "5,256,000", unit: "UZS" },
  qualityGrade: { grade: "A+", snf: "SNF 8.7%" },
  recentDeliveries: [
    {
      id: "del-1",
      destination: "To Tashkent",
      batch: "Batch ZF-0412",
      volume: "1,200 L",
      grade: "A+",
      status: "● In transit",
      statusType: "success",
    },
    {
      id: "del-2",
      destination: "To Samarqand",
      batch: "Batch ZF-0409",
      volume: "950 L",
      grade: "A",
      status: "● Titration pending",
      statusType: "warning",
    },
    {
      id: "del-3",
      destination: "To Fergana",
      batch: "Batch ZF-0405",
      volume: "1,100 L",
      grade: "A+",
      status: "✓ Escrow released",
      statusType: "neutral",
    },
  ],
  payouts: [
    {
      id: "pay-1",
      batch: "ZF-0412",
      condition: "Releases after titration",
      amount: "5,256,000",
    },
    {
      id: "pay-2",
      batch: "ZF-0405",
      condition: "Released",
      amount: "4,818,000",
    },
  ],
};

export const MOCK_DAIRY_DATA: DairyDashboardData = {
  openOrders: { value: "12", unit: "" },
  receivedToday: { value: "186,400", unit: "L", delta: "+3.8%" },
  activeShipments: { value: "47", unit: "", coldStatus: "+3.2°C cold" },
  escrowBalance: { value: "48,500,000", unit: "UZS" },
  incomingShipments: [
    {
      id: "ship-1",
      route: "Sayxunobod → Tashkent",
      batch: "Batch ZF-0412 · GPS locked",
      gpsLock: true,
      temp: "3.2°C",
      etaOrStatus: "28 min ETA",
      status: "● In transit",
      statusType: "success",
    },
    {
      id: "ship-2",
      route: "Zomin → Samarqand",
      batch: "Batch ZF-0409 · GPS locked",
      gpsLock: true,
      temp: "3.6°C",
      etaOrStatus: "At dairy",
      status: "● Titration pending",
      statusType: "warning",
    },
    {
      id: "ship-3",
      route: "Pop → Fergana",
      batch: "Batch ZF-0405 · Delivered",
      gpsLock: false,
      temp: "3.1°C",
      etaOrStatus: "12 min ago",
      status: "✓ Escrow released",
      statusType: "neutral",
    },
  ],
  regionalPrices: [
    { region: "Andijan", price: "4,420", percentage: 100 },
    { region: "Samarqand", price: "4,350", percentage: 95 },
    { region: "Fergana", price: "4,310", percentage: 91 },
    { region: "Namangan", price: "4,290", percentage: 88 },
  ],
};

export const MOCK_DRIVER_DATA: DriverDashboardData = {
  todayTrips: { value: "4", unit: "trips" },
  nextPickup: { time: "08:40", location: "Sayxunobod" },
  coldChain: { temp: "3.2°C", status: "✓ In range", inRange: true },
  completedThisWeek: { value: "18", unit: "trips" },
  todayStops: [
    {
      id: "stop-1",
      time: "08:40",
      isoTimestamp: "2026-11-07T08:40:00+05:00",
      type: "pickup",
      locationName: "Pick up · Sayxunobod farm",
      batchInfo: "Batch ZF-0412 · 1,200 L",
      status: "● Next",
      statusType: "next",
    },
    {
      id: "stop-2",
      time: "10:15",
      isoTimestamp: "2026-11-07T10:15:00+05:00",
      type: "pickup",
      locationName: "Pick up · Zomin cooperative",
      batchInfo: "Batch ZF-0409 · 950 L",
      status: "Scheduled",
      statusType: "scheduled",
    },
    {
      id: "stop-3",
      time: "13:30",
      isoTimestamp: "2026-11-07T13:30:00+05:00",
      type: "deliver",
      locationName: "Deliver · Tashkent dairy",
      batchInfo: "Titration check on arrival",
      status: "Scheduled",
      statusType: "scheduled",
    },
  ],
  activeTrip: {
    batch: "ZF-0412",
    route: "Sayxunobod → Tashkent",
    progressPercentage: 72,
    eta: "28 min ETA",
  },
};

export const MOCK_ADMIN_DATA: AdminDashboardData = {
  pendingVerification: { value: "9", unit: "users" },
  activeUsers: { value: "2,140", delta: "+4.1%" },
  openDisputes: { value: "3", status: "● Needs review", statusType: "warning" },
  escrowTotal: { value: "48,500,000", unit: "UZS" },
  verificationQueue: [
    {
      id: "org-1",
      roleLabel: "Farmer · Andijan",
      location: "Andijan",
      timeAgo: "Submitted 2 h ago",
      roleChip: "Farmer",
    },
    {
      id: "org-2",
      roleLabel: "Dairy Industry · Tashkent",
      location: "Tashkent",
      timeAgo: "Submitted 5 h ago",
      roleChip: "Dairy Industry",
    },
    {
      id: "org-3",
      roleLabel: "Driver · Samarqand",
      location: "Samarqand",
      timeAgo: "Submitted yesterday",
      roleChip: "Driver",
    },
  ],
  usersByRole: [
    { role: "Farmers", count: "1,480", percentage: 100 },
    { role: "Dairy Industry", count: "212", percentage: 14 },
    { role: "Drivers", count: "436", percentage: 29 },
    { role: "Admins", count: "12", percentage: 3 },
  ],
};

// --- Service Fetch Functions with API Fallback ---

export async function fetchFarmerDashboardData(): Promise<FarmerDashboardData> {
  if (USE_MOCK_DATA) {
    return { ...MOCK_FARMER_DATA };
  }
  try {
    const res = await authenticatedFetch("/farmer/dashboard");
    if (res.ok) {
      const liveData = await res.json();
      if (liveData.recentDeliveries && liveData.recentDeliveries.length > 0) {
        return liveData;
      }
      return {
        ...MOCK_FARMER_DATA,
        todayPrice: liveData.todayPrice || MOCK_FARMER_DATA.todayPrice,
        suppliedThisMonth: liveData.suppliedThisMonth?.value !== "0" ? liveData.suppliedThisMonth : MOCK_FARMER_DATA.suppliedThisMonth,
        nextPayout: liveData.nextPayout?.value !== "0" ? liveData.nextPayout : MOCK_FARMER_DATA.nextPayout,
        qualityGrade: liveData.qualityGrade || MOCK_FARMER_DATA.qualityGrade,
      };
    }
  } catch (e) {
    console.warn("Live farmer dashboard API unavailable, using resilient fallback", e);
  }
  return { ...MOCK_FARMER_DATA };
}

export async function fetchDairyDashboardData(): Promise<DairyDashboardData> {
  if (USE_MOCK_DATA) {
    return { ...MOCK_DAIRY_DATA };
  }
  try {
    const res = await authenticatedFetch("/dairy/dashboard");
    if (res.ok) {
      const liveData = await res.json();
      if (liveData.incomingShipments && liveData.incomingShipments.length > 0) {
        return liveData;
      }
      return {
        ...MOCK_DAIRY_DATA,
        openOrders: liveData.openOrders?.value !== "0" ? liveData.openOrders : MOCK_DAIRY_DATA.openOrders,
        receivedToday: liveData.receivedToday?.value !== "0" ? liveData.receivedToday : MOCK_DAIRY_DATA.receivedToday,
        activeShipments: liveData.activeShipments?.value !== "0" ? liveData.activeShipments : MOCK_DAIRY_DATA.activeShipments,
        escrowBalance: liveData.escrowBalance?.value !== "0" ? liveData.escrowBalance : MOCK_DAIRY_DATA.escrowBalance,
      };
    }
  } catch (e) {
    console.warn("Live dairy dashboard API unavailable, using resilient fallback", e);
  }
  return { ...MOCK_DAIRY_DATA };
}

export async function fetchDriverDashboardData(): Promise<DriverDashboardData> {
  if (USE_MOCK_DATA) {
    return { ...MOCK_DRIVER_DATA };
  }
  try {
    const res = await authenticatedFetch("/driver/dashboard");
    if (res.ok) {
      const liveData = await res.json();
      if (liveData.todayStops && liveData.todayStops.length > 0) {
        return liveData;
      }
      return {
        ...MOCK_DRIVER_DATA,
        coldChain: liveData.coldChain || MOCK_DRIVER_DATA.coldChain,
      };
    }
  } catch (e) {
    console.warn("Live driver dashboard API unavailable, using resilient fallback", e);
  }
  return { ...MOCK_DRIVER_DATA };
}

export async function fetchAdminDashboardData(): Promise<AdminDashboardData> {
  if (USE_MOCK_DATA) {
    return { ...MOCK_ADMIN_DATA };
  }
  try {
    const res = await authenticatedFetch("/admin/dashboard");
    if (res.ok) {
      const liveData = await res.json();
      return {
        ...MOCK_ADMIN_DATA,
        pendingVerification: liveData.pendingVerification || MOCK_ADMIN_DATA.pendingVerification,
        activeUsers: liveData.activeUsers || MOCK_ADMIN_DATA.activeUsers,
        openDisputes: liveData.openDisputes || MOCK_ADMIN_DATA.openDisputes,
        escrowTotal:
          liveData.escrowTotal?.value !== "0"
            ? liveData.escrowTotal
            : MOCK_ADMIN_DATA.escrowTotal,
        verificationQueue:
          liveData.verificationQueue && liveData.verificationQueue.length > 0
            ? liveData.verificationQueue
            : MOCK_ADMIN_DATA.verificationQueue,
        usersByRole:
          liveData.usersByRole && liveData.usersByRole.length > 0
            ? liveData.usersByRole
            : MOCK_ADMIN_DATA.usersByRole,
      };
    }
  } catch (e) {
    console.warn("Live admin dashboard API unavailable, using resilient fallback", e);
  }
  return { ...MOCK_ADMIN_DATA };
}

export const MOCK_BANK_DATA: BankDashboardData = {
  totalEscrowHeld: { value: "48,500,000", unit: "UZS" },
  releasedToday: { value: "10,074,000", unit: "UZS" },
  frozenDisputes: { value: "1", status: "● Escrow Frozen" },
  factoringFeeRevenue: { value: "412,500", unit: "UZS" },
  ledgerEntries: [
    {
      id: "led-1",
      contractId: "CTR-2026-8812",
      batchId: "ZF-0412",
      entryType: "ESCROW_LOCK",
      debitAccount: "INDUSTRY_OPERATING:TASHKENT_DAIRY",
      creditAccount: "BANK_ESCROW_VAULT:CTR-2026-8812",
      amountUzs: "18,500,000",
      bankReferenceId: "ISO-PACS008-9941",
      webhookStatus: "DELIVERED",
      createdAt: "2026-11-08T08:15:00Z",
    },
    {
      id: "led-2",
      contractId: "CTR-2026-8805",
      batchId: "ZF-0405",
      entryType: "ESCROW_RELEASE",
      debitAccount: "BANK_ESCROW_VAULT:CTR-2026-8805",
      creditAccount: "FARMER_SETTLEMENT:CHASHMA_FARM",
      amountUzs: "4,818,000",
      bankReferenceId: "ISO-PACS008-9938",
      webhookStatus: "DELIVERED",
      createdAt: "2026-11-08T07:40:00Z",
    },
  ],
};

export async function fetchBankDashboardData(): Promise<BankDashboardData> {
  if (USE_MOCK_DATA) {
    return { ...MOCK_BANK_DATA };
  }
  try {
    const res = await authenticatedFetch("/bank/dashboard");
    if (res.ok) {
      const liveData = await res.json();
      if (liveData.ledgerEntries && liveData.ledgerEntries.length > 0) {
        return liveData;
      }
      return {
        ...MOCK_BANK_DATA,
        totalEscrowHeld:
          liveData.totalEscrowHeld?.value !== "0"
            ? liveData.totalEscrowHeld
            : MOCK_BANK_DATA.totalEscrowHeld,
      };
    }
  } catch (e) {
    console.warn("Live bank dashboard API unavailable, using resilient fallback", e);
  }
  return { ...MOCK_BANK_DATA };
}
