/**
 * Farmer Module State & Data Management
 *
 * Provides persistent in-memory / local storage backing for:
 * - GAP-01: My milk inventory
 * - GAP-02: Deliveries history & live tracking
 * - GAP-03: Payouts & escrow ledger
 * - GAP-04: List milk supply form submissions
 * - GAP-05: Batch telemetry details
 * - GAP-06: Quality titration disputes
 */

export interface MilkBatch {
  id: string;
  batchNumber: string;
  volumeLiters: number;
  milkingDate: string;
  milkingSession: "morning" | "evening";
  storageTempC: number;
  qualityGrade: "A+" | "A" | "B";
  fatPercent: number;
  snfPercent: number;
  acidityT: number;
  pricePerLiter: number;
  totalEstimatedPayout: number;
  status: "stored" | "scheduled" | "in_transit" | "testing" | "released" | "disputed";
  destinationPlant: string;
  pickupWindow: string;
  driverName?: string;
  driverPhone?: string;
  truckPlate?: string;
  tankerTempC?: number;
  eta?: string;
  escrowStatus: "locked" | "released" | "frozen";
  disputeReason?: string;
}

export const INITIAL_FARMER_BATCHES: MilkBatch[] = [
  {
    id: "zf-0412",
    batchNumber: "ZF-0412",
    volumeLiters: 1200,
    milkingDate: "Today, 06:30",
    milkingSession: "morning",
    storageTempC: 3.2,
    qualityGrade: "A+",
    fatPercent: 4.1,
    snfPercent: 8.7,
    acidityT: 16.5,
    pricePerLiter: 4380,
    totalEstimatedPayout: 5256000,
    status: "in_transit",
    destinationPlant: "Tashkent Central Dairy",
    pickupWindow: "08:00 - 09:30",
    driverName: "Bobur Rahimov",
    driverPhone: "+998 90 123 45 67",
    truckPlate: "01 772 AAA",
    tankerTempC: 3.2,
    eta: "28 min ETA",
    escrowStatus: "locked",
  },
  {
    id: "zf-0409",
    batchNumber: "ZF-0409",
    volumeLiters: 950,
    milkingDate: "Yesterday, 17:00",
    milkingSession: "evening",
    storageTempC: 3.6,
    qualityGrade: "A",
    fatPercent: 3.8,
    snfPercent: 8.5,
    acidityT: 18.2,
    pricePerLiter: 4150,
    totalEstimatedPayout: 3942500,
    status: "testing",
    destinationPlant: "Samarqand Milk Products",
    pickupWindow: "10:00 - 11:30",
    driverName: "Dilshod Karimov",
    driverPhone: "+998 93 456 78 90",
    truckPlate: "30 456 BBB",
    tankerTempC: 3.6,
    eta: "Arrived at Gate",
    escrowStatus: "locked",
  },
  {
    id: "zf-0405",
    batchNumber: "ZF-0405",
    volumeLiters: 1100,
    milkingDate: "05 Nov, 06:45",
    milkingSession: "morning",
    storageTempC: 3.1,
    qualityGrade: "A+",
    fatPercent: 4.2,
    snfPercent: 8.8,
    acidityT: 16.0,
    pricePerLiter: 4380,
    totalEstimatedPayout: 4818000,
    status: "released",
    destinationPlant: "Fergana Valley Dairy",
    pickupWindow: "08:15 - 09:45",
    driverName: "Jamshid Aliyev",
    driverPhone: "+998 97 789 01 23",
    truckPlate: "40 888 CCC",
    tankerTempC: 3.1,
    eta: "Completed",
    escrowStatus: "released",
  },
  {
    id: "zf-0415",
    batchNumber: "ZF-0415",
    volumeLiters: 1500,
    milkingDate: "Today, 17:30",
    milkingSession: "evening",
    storageTempC: 3.4,
    qualityGrade: "A+",
    fatPercent: 4.0,
    snfPercent: 8.6,
    acidityT: 16.8,
    pricePerLiter: 4380,
    totalEstimatedPayout: 6570000,
    status: "stored",
    destinationPlant: "Tashkent Central Dairy",
    pickupWindow: "Tomorrow, 07:00 - 08:30",
    escrowStatus: "locked",
  },
];

const STORAGE_KEY = "zaminflow_farmer_batches";

export function getFarmerBatches(): MilkBatch[] {
  if (typeof window === "undefined") return INITIAL_FARMER_BATCHES;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_FARMER_BATCHES));
    return INITIAL_FARMER_BATCHES;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_FARMER_BATCHES;
  }
}

export function saveFarmerBatches(batches: MilkBatch[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(batches));
}

export function addFarmerBatch(batch: Omit<MilkBatch, "id" | "batchNumber">): MilkBatch {
  const batches = getFarmerBatches();
  const nextNum = 416 + batches.length;
  const newBatch: MilkBatch = {
    ...batch,
    id: `zf-0${nextNum}`,
    batchNumber: `ZF-0${nextNum}`,
  };
  const updated = [newBatch, ...batches];
  saveFarmerBatches(updated);
  return newBatch;
}

export function getBatchById(idOrBatchNumber: string): MilkBatch | undefined {
  const batches = getFarmerBatches();
  const clean = idOrBatchNumber.trim().toLowerCase();
  return batches.find(
    (b) => b.id.toLowerCase() === clean || b.batchNumber.toLowerCase() === clean
  );
}

export function fileBatchDispute(batchNumber: string, reason: string): MilkBatch | null {
  const batches = getFarmerBatches();
  const idx = batches.findIndex(
    (b) => b.batchNumber.toLowerCase() === batchNumber.trim().toLowerCase()
  );
  if (idx === -1) return null;
  batches[idx].status = "disputed";
  batches[idx].escrowStatus = "frozen";
  batches[idx].disputeReason = reason;
  saveFarmerBatches(batches);
  return batches[idx];
}
