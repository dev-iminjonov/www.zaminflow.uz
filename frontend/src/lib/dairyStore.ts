/**
 * Dairy Industry Module State & Data Management
 *
 * Provides persistent state backing for:
 * - GAP-07: Orders management & procurement contracts
 * - GAP-08: Inbound shipments fleet logistics
 * - GAP-09: Escrow treasury & deposit accounts
 * - GAP-10: Place order form submissions
 * - GAP-11: Gate receiving & laboratory titration test entry
 * - GAP-12: Regional pricing configurator
 */

export interface DairyOrder {
  id: string;
  orderNumber: string;
  targetVolumeLiters: number;
  fulfilledVolumeLiters: number;
  requiredGrade: "A+" | "A" | "B";
  destinationPlant: string;
  maxPricePerLiter: number;
  deliveryDate: string;
  status: "open" | "in_transit" | "fulfilled" | "draft";
  supplierCount: number;
  lockedEscrowUZS: number;
}

export interface DairyShipment {
  id: string;
  batchNumber: string;
  route: string;
  sourceRegion: string;
  destinationPlant: string;
  volumeLiters: number;
  tempC: number;
  etaOrStatus: string;
  status: "in_transit" | "testing" | "released";
  driverName: string;
  driverPhone: string;
  truckPlate: string;
  gpsLock: boolean;
  fatPercent?: number;
  snfPercent?: number;
  acidityT?: number;
}

export interface RegionalPriceConfig {
  region: string;
  basePriceUZS: number;
  gradeAPlusBonusUZS: number;
  gradeBDeductionUZS: number;
  liquidityDailyLiters: number;
}

export const INITIAL_DAIRY_ORDERS: DairyOrder[] = [
  {
    id: "ord-1",
    orderNumber: "ORD-2026-081",
    targetVolumeLiters: 50000,
    fulfilledVolumeLiters: 42100,
    requiredGrade: "A+",
    destinationPlant: "Tashkent Central Dairy",
    maxPricePerLiter: 4400,
    deliveryDate: "Today, 18:00",
    status: "in_transit",
    supplierCount: 8,
    lockedEscrowUZS: 185240000,
  },
  {
    id: "ord-2",
    orderNumber: "ORD-2026-079",
    targetVolumeLiters: 25000,
    fulfilledVolumeLiters: 25000,
    requiredGrade: "A",
    destinationPlant: "Samarqand Milk Products",
    maxPricePerLiter: 4200,
    deliveryDate: "Yesterday",
    status: "fulfilled",
    supplierCount: 4,
    lockedEscrowUZS: 105000000,
  },
  {
    id: "ord-3",
    orderNumber: "ORD-2026-085",
    targetVolumeLiters: 35000,
    fulfilledVolumeLiters: 12400,
    requiredGrade: "A+",
    destinationPlant: "Fergana Valley Dairy",
    maxPricePerLiter: 4350,
    deliveryDate: "Tomorrow, 12:00",
    status: "open",
    supplierCount: 5,
    lockedEscrowUZS: 152250000,
  },
];

export const INITIAL_DAIRY_SHIPMENTS: DairyShipment[] = [
  {
    id: "ship-1",
    batchNumber: "ZF-0412",
    route: "Sayxunobod → Tashkent",
    sourceRegion: "Sirdaryo / Sayxunobod",
    destinationPlant: "Tashkent Central Dairy",
    volumeLiters: 1200,
    tempC: 3.2,
    etaOrStatus: "28 min ETA",
    status: "in_transit",
    driverName: "Bobur Rahimov",
    driverPhone: "+998 90 123 45 67",
    truckPlate: "01 772 AAA",
    gpsLock: true,
  },
  {
    id: "ship-2",
    batchNumber: "ZF-0409",
    route: "Zomin → Samarqand",
    sourceRegion: "Jizzakh / Zomin",
    destinationPlant: "Samarqand Milk Products",
    volumeLiters: 950,
    tempC: 3.6,
    etaOrStatus: "At dairy",
    status: "testing",
    driverName: "Dilshod Karimov",
    driverPhone: "+998 93 456 78 90",
    truckPlate: "30 456 BBB",
    gpsLock: true,
  },
  {
    id: "ship-3",
    batchNumber: "ZF-0405",
    route: "Pop → Fergana",
    sourceRegion: "Namangan / Pop",
    destinationPlant: "Fergana Valley Dairy",
    volumeLiters: 1100,
    tempC: 3.1,
    etaOrStatus: "12 min ago",
    status: "released",
    driverName: "Jamshid Aliyev",
    driverPhone: "+998 97 789 01 23",
    truckPlate: "40 888 CCC",
    gpsLock: false,
    fatPercent: 4.2,
    snfPercent: 8.8,
    acidityT: 16.0,
  },
];

export const INITIAL_REGIONAL_PRICES: RegionalPriceConfig[] = [
  {
    region: "Andijan",
    basePriceUZS: 4420,
    gradeAPlusBonusUZS: 250,
    gradeBDeductionUZS: 350,
    liquidityDailyLiters: 48000,
  },
  {
    region: "Samarqand",
    basePriceUZS: 4350,
    gradeAPlusBonusUZS: 250,
    gradeBDeductionUZS: 350,
    liquidityDailyLiters: 65000,
  },
  {
    region: "Fergana",
    basePriceUZS: 4310,
    gradeAPlusBonusUZS: 240,
    gradeBDeductionUZS: 350,
    liquidityDailyLiters: 52000,
  },
  {
    region: "Namangan",
    basePriceUZS: 4290,
    gradeAPlusBonusUZS: 240,
    gradeBDeductionUZS: 350,
    liquidityDailyLiters: 38000,
  },
  {
    region: "Tashkent",
    basePriceUZS: 4380,
    gradeAPlusBonusUZS: 260,
    gradeBDeductionUZS: 350,
    liquidityDailyLiters: 85000,
  },
];

const ORDERS_KEY = "zaminflow_dairy_orders";
const SHIPMENTS_KEY = "zaminflow_dairy_shipments";
const PRICES_KEY = "zaminflow_dairy_prices";

export function getDairyOrders(): DairyOrder[] {
  if (typeof window === "undefined") return INITIAL_DAIRY_ORDERS;
  const stored = localStorage.getItem(ORDERS_KEY);
  if (!stored) {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(INITIAL_DAIRY_ORDERS));
    return INITIAL_DAIRY_ORDERS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_DAIRY_ORDERS;
  }
}

export function saveDairyOrders(orders: DairyOrder[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

export function addDairyOrder(order: Omit<DairyOrder, "id" | "orderNumber" | "fulfilledVolumeLiters">): DairyOrder {
  const orders = getDairyOrders();
  const nextNum = 86 + orders.length;
  const newOrder: DairyOrder = {
    ...order,
    id: `ord-${orders.length + 1}`,
    orderNumber: `ORD-2026-0${nextNum}`,
    fulfilledVolumeLiters: 0,
  };
  const updated = [newOrder, ...orders];
  saveDairyOrders(updated);
  return newOrder;
}

export function getDairyShipments(): DairyShipment[] {
  if (typeof window === "undefined") return INITIAL_DAIRY_SHIPMENTS;
  const stored = localStorage.getItem(SHIPMENTS_KEY);
  if (!stored) {
    localStorage.setItem(SHIPMENTS_KEY, JSON.stringify(INITIAL_DAIRY_SHIPMENTS));
    return INITIAL_DAIRY_SHIPMENTS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_DAIRY_SHIPMENTS;
  }
}

export function saveDairyShipments(shipments: DairyShipment[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SHIPMENTS_KEY, JSON.stringify(shipments));
}

export function submitGateLabTest(
  batchNumber: string,
  labData: { fatPercent: number; snfPercent: number; acidityT: number }
): DairyShipment | null {
  const shipments = getDairyShipments();
  const idx = shipments.findIndex((s) => s.batchNumber.toLowerCase() === batchNumber.trim().toLowerCase());
  if (idx === -1) return null;
  shipments[idx].status = "released";
  shipments[idx].etaOrStatus = "Escrow released to farmer";
  shipments[idx].fatPercent = labData.fatPercent;
  shipments[idx].snfPercent = labData.snfPercent;
  shipments[idx].acidityT = labData.acidityT;
  saveDairyShipments(shipments);
  return shipments[idx];
}

export function getRegionalPrices(): RegionalPriceConfig[] {
  if (typeof window === "undefined") return INITIAL_REGIONAL_PRICES;
  const stored = localStorage.getItem(PRICES_KEY);
  if (!stored) {
    localStorage.setItem(PRICES_KEY, JSON.stringify(INITIAL_REGIONAL_PRICES));
    return INITIAL_REGIONAL_PRICES;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_REGIONAL_PRICES;
  }
}

export function saveRegionalPrices(prices: RegionalPriceConfig[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PRICES_KEY, JSON.stringify(prices));
}
