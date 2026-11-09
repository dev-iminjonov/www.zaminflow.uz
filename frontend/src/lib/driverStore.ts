/**
 * Driver Module State & Data Management
 *
 * Provides persistent state backing for:
 * - GAP-13: My trips daily manifest
 * - GAP-14: Route navigation
 * - GAP-15: Trip history & mileage archive
 * - GAP-16: Start next trip pre-trip check
 * - GAP-17: Confirm pickup farm handover verification
 * - GAP-18: Incident reporting
 */

export interface DriverTripStop {
  id: string;
  time: string;
  type: "pickup" | "deliver";
  locationName: string;
  address: string;
  batchNumber: string;
  volumeLiters: number;
  contactName: string;
  contactPhone: string;
  status: "next" | "scheduled" | "completed";
}

export type DriverStop = DriverTripStop;

export interface DriverHistoryRecord {
  id: string;
  date: string;
  batchNumber: string;
  route: string;
  distanceKm: number;
  volumeLiters: number;
  avgTempC: number;
  coldChainPassed: boolean;
  driverEarningsUZS: number;
  tripId?: string;
  completedDate?: string;
  fromLocation?: string;
  toLocation?: string;
  avgTemperatureC?: number;
}

export const INITIAL_DRIVER_STOPS: DriverTripStop[] = [
  {
    id: "stop-1",
    time: "08:40",
    type: "pickup",
    locationName: "Pick up · Sayxunobod Farm",
    address: "Sayxunobod district, Sirdaryo region",
    batchNumber: "ZF-0412",
    volumeLiters: 1200,
    contactName: "Muhammadaziz Iminjonov",
    contactPhone: "+998 90 123 45 67",
    status: "next",
  },
  {
    id: "stop-2",
    time: "10:15",
    type: "pickup",
    locationName: "Pick up · Zomin Cooperative",
    address: "Zomin district, Jizzakh region",
    batchNumber: "ZF-0409",
    volumeLiters: 950,
    contactName: "Erkin Toshmatov",
    contactPhone: "+998 93 456 78 90",
    status: "scheduled",
  },
  {
    id: "stop-3",
    time: "13:30",
    type: "deliver",
    locationName: "Deliver · Tashkent Central Dairy",
    address: "Sergeli district, Tashkent city",
    batchNumber: "Intake ZF-0412 & ZF-0409",
    volumeLiters: 2150,
    contactName: "Malika Alimova (Intake Lab)",
    contactPhone: "+998 71 200 11 22",
    status: "scheduled",
  },
];

export const INITIAL_DRIVER_HISTORY: DriverHistoryRecord[] = [
  {
    id: "hist-1",
    date: "06 Nov 2026",
    batchNumber: "ZF-0405",
    route: "Pop → Fergana Valley Dairy",
    distanceKm: 85,
    volumeLiters: 1100,
    avgTempC: 3.1,
    coldChainPassed: true,
    driverEarningsUZS: 425000,
  },
  {
    id: "hist-2",
    date: "05 Nov 2026",
    batchNumber: "ZF-0398",
    route: "Zomin → Tashkent Central Dairy",
    distanceKm: 160,
    volumeLiters: 1800,
    avgTempC: 3.3,
    coldChainPassed: true,
    driverEarningsUZS: 800000,
  },
  {
    id: "hist-3",
    date: "04 Nov 2026",
    batchNumber: "ZF-0391",
    route: "Sayxunobod → Samarqand Milk Products",
    distanceKm: 210,
    volumeLiters: 2400,
    avgTempC: 3.4,
    coldChainPassed: true,
    driverEarningsUZS: 1050000,
  },
];

const STOPS_KEY = "zaminflow_driver_stops";
const HISTORY_KEY = "zaminflow_driver_history";

export function getDriverStops(): DriverTripStop[] {
  if (typeof window === "undefined") return INITIAL_DRIVER_STOPS;
  const stored = localStorage.getItem(STOPS_KEY);
  if (!stored) {
    localStorage.setItem(STOPS_KEY, JSON.stringify(INITIAL_DRIVER_STOPS));
    return INITIAL_DRIVER_STOPS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_DRIVER_STOPS;
  }
}

export function getDriverHistory(): DriverHistoryRecord[] {
  if (typeof window === "undefined") return INITIAL_DRIVER_HISTORY;
  const stored = localStorage.getItem(HISTORY_KEY);
  if (!stored) {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(INITIAL_DRIVER_HISTORY));
    return INITIAL_DRIVER_HISTORY;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_DRIVER_HISTORY;
  }
}

export const getDriverManifest = getDriverStops;

