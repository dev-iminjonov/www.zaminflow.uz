/**
 * Role Dashboard Telemetry Service
 *
 * Provides real-time telemetry data for the five ZaminFlow role dashboards:
 * - Farmer
 * - Dairy Industry
 * - Driver
 * - Admin
 * - Bank
 *
 * Strictly connects to live FastAPI backend endpoints (/api/v1/*).
 * Clean empty states are served when newly registered tenants have 0 transactions,
 * preventing fake data leaks during production launch.
 */

import { authenticatedFetch } from "./auth";

export const USE_MOCK_DATA =
  process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

// --- Types ---

export interface FarmerDashboardData {
  todayPrice: { value: string; unit: string; delta: string };
  suppliedThisMonth: { value: string; unit: string };
  nextPayout: { value: string; unit: string };
  qualityGrade: { grade: string; snf: string; fat?: string; density?: string };
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

// --- Production Clean Empty States (Zero-Data Defaults) ---

export const EMPTY_FARMER_DATA: FarmerDashboardData = {
  todayPrice: { value: "0", unit: "UZS / L", delta: "0%" },
  suppliedThisMonth: { value: "0", unit: "L" },
  nextPayout: { value: "0", unit: "UZS" },
  qualityGrade: { grade: "-", snf: "0%" },
  recentDeliveries: [],
  payouts: [],
};

export const EMPTY_DAIRY_DATA: DairyDashboardData = {
  openOrders: { value: "0", unit: "" },
  receivedToday: { value: "0", unit: "L", delta: "0%" },
  activeShipments: { value: "0", unit: "", coldStatus: "Normal" },
  escrowBalance: { value: "0", unit: "UZS" },
  incomingShipments: [],
  regionalPrices: [],
};

export const EMPTY_DRIVER_DATA: DriverDashboardData = {
  todayTrips: { value: "0", unit: "reys" },
  nextPickup: { time: "--:--", location: "Tayinlangan reys yöq" },
  coldChain: { temp: "--.-°C", status: "Kutilmoqda", inRange: true },
  completedThisWeek: { value: "0", unit: "reys" },
  todayStops: [],
  activeTrip: {
    batch: "-",
    route: "Faol reys mavjud emas",
    progressPercentage: 0,
    eta: "--",
  },
};

export const EMPTY_ADMIN_DATA: AdminDashboardData = {
  pendingVerification: { value: "0", unit: "dossye" },
  activeUsers: { value: "0", delta: "0%" },
  openDisputes: { value: "0", status: "✓ Tinch", statusType: "neutral" },
  escrowTotal: { value: "0", unit: "UZS" },
  verificationQueue: [],
  usersByRole: [
    { role: "Farmers", count: "0", percentage: 0 },
    { role: "Dairy Industry", count: "0", percentage: 0 },
    { role: "Drivers", count: "0", percentage: 0 },
    { role: "Admins", count: "0", percentage: 0 },
  ],
};

export const EMPTY_BANK_DATA: BankDashboardData = {
  totalEscrowHeld: { value: "0", unit: "UZS" },
  releasedToday: { value: "0", unit: "UZS" },
  frozenDisputes: { value: "0", status: "✓ Barqaror" },
  factoringFeeRevenue: { value: "0", unit: "UZS" },
  ledgerEntries: [],
};

// Fallback Mock Data ONLY used when explicit mock mode is on (NEXT_PUBLIC_USE_MOCK_DATA=true)
export const MOCK_FARMER_DATA = EMPTY_FARMER_DATA;
export const MOCK_DAIRY_DATA = EMPTY_DAIRY_DATA;
export const MOCK_DRIVER_DATA = EMPTY_DRIVER_DATA;
export const MOCK_ADMIN_DATA = EMPTY_ADMIN_DATA;
export const MOCK_BANK_DATA = EMPTY_BANK_DATA;

// --- Service Fetch Functions Calling Live /api/v1 Endpoints ---

export async function fetchFarmerDashboardData(): Promise<FarmerDashboardData> {
  try {
    const res = await authenticatedFetch("/api/v1/farmer/dashboard");
    if (res.ok) {
      const liveData = await res.json();
      return {
        todayPrice: liveData.todayPrice || EMPTY_FARMER_DATA.todayPrice,
        suppliedThisMonth: liveData.suppliedThisMonth || EMPTY_FARMER_DATA.suppliedThisMonth,
        nextPayout: liveData.nextPayout || EMPTY_FARMER_DATA.nextPayout,
        qualityGrade: liveData.qualityGrade || EMPTY_FARMER_DATA.qualityGrade,
        recentDeliveries: Array.isArray(liveData.recentDeliveries) ? liveData.recentDeliveries : [],
        payouts: Array.isArray(liveData.payouts) ? liveData.payouts : [],
      };
    }
  } catch (e) {
    console.warn("Live farmer dashboard API request failed:", e);
  }
  return { ...EMPTY_FARMER_DATA };
}

export async function fetchDairyDashboardData(): Promise<DairyDashboardData> {
  try {
    const res = await authenticatedFetch("/api/v1/dairy/dashboard");
    if (res.ok) {
      const liveData = await res.json();
      return {
        openOrders: liveData.openOrders || EMPTY_DAIRY_DATA.openOrders,
        receivedToday: liveData.receivedToday || EMPTY_DAIRY_DATA.receivedToday,
        activeShipments: liveData.activeShipments || EMPTY_DAIRY_DATA.activeShipments,
        escrowBalance: liveData.escrowBalance || EMPTY_DAIRY_DATA.escrowBalance,
        incomingShipments: Array.isArray(liveData.incomingShipments) ? liveData.incomingShipments : [],
        regionalPrices: Array.isArray(liveData.regionalPrices) ? liveData.regionalPrices : [],
      };
    }
  } catch (e) {
    console.warn("Live dairy dashboard API request failed:", e);
  }
  return { ...EMPTY_DAIRY_DATA };
}

export async function fetchDriverDashboardData(): Promise<DriverDashboardData> {
  try {
    const res = await authenticatedFetch("/api/v1/driver/dashboard");
    if (res.ok) {
      const liveData = await res.json();
      return {
        todayTrips: liveData.todayTrips || EMPTY_DRIVER_DATA.todayTrips,
        nextPickup: liveData.nextPickup || EMPTY_DRIVER_DATA.nextPickup,
        coldChain: liveData.coldChain || EMPTY_DRIVER_DATA.coldChain,
        completedThisWeek: liveData.completedThisWeek || EMPTY_DRIVER_DATA.completedThisWeek,
        todayStops: Array.isArray(liveData.todayStops) ? liveData.todayStops : [],
        activeTrip: liveData.activeTrip || EMPTY_DRIVER_DATA.activeTrip,
      };
    }
  } catch (e) {
    console.warn("Live driver dashboard API request failed:", e);
  }
  return { ...EMPTY_DRIVER_DATA };
}

export async function fetchAdminDashboardData(): Promise<AdminDashboardData> {
  try {
    const res = await authenticatedFetch("/api/v1/admin/dashboard");
    if (res.ok) {
      const liveData = await res.json();
      return {
        pendingVerification: liveData.pendingVerification || EMPTY_ADMIN_DATA.pendingVerification,
        activeUsers: liveData.activeUsers || EMPTY_ADMIN_DATA.activeUsers,
        openDisputes: liveData.openDisputes || EMPTY_ADMIN_DATA.openDisputes,
        escrowTotal: liveData.escrowTotal || EMPTY_ADMIN_DATA.escrowTotal,
        verificationQueue: Array.isArray(liveData.verificationQueue) ? liveData.verificationQueue : [],
        usersByRole: Array.isArray(liveData.usersByRole) ? liveData.usersByRole : EMPTY_ADMIN_DATA.usersByRole,
      };
    }
  } catch (e) {
    console.warn("Live admin dashboard API request failed:", e);
  }
  return { ...EMPTY_ADMIN_DATA };
}

export async function fetchBankDashboardData(): Promise<BankDashboardData> {
  try {
    const res = await authenticatedFetch("/api/v1/bank/dashboard");
    if (res.ok) {
      const liveData = await res.json();
      return {
        totalEscrowHeld: liveData.totalEscrowHeld || EMPTY_BANK_DATA.totalEscrowHeld,
        releasedToday: liveData.releasedToday || EMPTY_BANK_DATA.releasedToday,
        frozenDisputes: liveData.frozenDisputes || EMPTY_BANK_DATA.frozenDisputes,
        factoringFeeRevenue: liveData.factoringFeeRevenue || EMPTY_BANK_DATA.factoringFeeRevenue,
        ledgerEntries: Array.isArray(liveData.ledgerEntries) ? liveData.ledgerEntries : [],
      };
    }
  } catch (e) {
    console.warn("Live bank dashboard API request failed:", e);
  }
  return { ...EMPTY_BANK_DATA };
}

// --- Live Action Methods ---

export async function submitFarmerSupplyListing(data: {
  volume_liters: number;
  cooling_temp_c: number;
  milking_session: "MORNING" | "EVENING";
  fat_pct?: number;
  snf_pct?: number;
  acidity_turner?: number;
}): Promise<{ success: boolean; detail?: string }> {
  const res = await authenticatedFetch("/api/v1/farmer/supply", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Sut partiyasini e'lon qilishda xatolik yuz berdi");
  }
  return await res.json();
}

export async function submitBatchDispute(
  batchId: string,
  reason: string
): Promise<{ success: boolean; detail?: string }> {
  const res = await authenticatedFetch(`/api/v1/farmer/batches/${batchId}/dispute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Arbitraj da'vosini yuborishda xatolik yuz berdi");
  }
  return await res.json();
}
