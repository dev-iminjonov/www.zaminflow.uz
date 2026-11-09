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

export const INITIAL_DRIVER_STOPS: DriverTripStop[] = [];

export const INITIAL_DRIVER_HISTORY: DriverHistoryRecord[] = [];

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

