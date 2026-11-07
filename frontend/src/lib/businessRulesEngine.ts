/**
 * ZaminFlow Platform Business Rules Engine
 *
 * Implements the core mathematical formulas and business policies for:
 * - GAP-23: Quality-Price Valuation Matrix Engine
 * - GAP-24: Escrow Banking Settlement Engine
 * - GAP-25: Cold-Chain SLA & Breach Penalties
 * - GAP-26: Real-Time Notification & Alert Dispatch
 */

// ==========================================
// GAP-23: Quality-Price Valuation Matrix Engine
// ==========================================

export interface QualityValuationInput {
  baseSpotRateUZS: number;      // e.g. 4,100 UZS / L
  fatPercent: number;           // Standard: 3.6%
  snfPercent: number;           // Standard: 8.5%
  acidityT: number;             // Standard: 16 - 18°T (Turner degrees)
}

export interface QualityValuationResult {
  grade: "A+" | "A" | "B" | "REJECTED";
  fatPremiumUZS: number;
  snfPremiumUZS: number;
  acidityPenaltyUZS: number;
  effectiveRatePerLiterUZS: number;
  bonusPercentage: number;
  isEligibleForBottling: boolean;
  notes: string;
}

export function calculateMilkValuation(input: QualityValuationInput): QualityValuationResult {
  const { baseSpotRateUZS, fatPercent, snfPercent, acidityT } = input;

  // Rejection check: Sour milk or water dilution
  if (acidityT > 21.0) {
    return {
      grade: "REJECTED",
      fatPremiumUZS: 0,
      snfPremiumUZS: 0,
      acidityPenaltyUZS: baseSpotRateUZS,
      effectiveRatePerLiterUZS: 0,
      bonusPercentage: -100,
      isEligibleForBottling: false,
      notes: "Severe acidification (>21°T); sour milk rejected at gate reception.",
    };
  }

  // Grade A+: Fat >= 4.0%, SNF >= 8.6%, Acidity 16 - 17°T
  if (fatPercent >= 4.0 && snfPercent >= 8.6 && acidityT <= 17.5) {
    const fatBonus = Math.round((fatPercent - 3.6) * 350);
    const snfBonus = Math.round((snfPercent - 8.5) * 450);
    const effectiveRate = baseSpotRateUZS + fatBonus + snfBonus + 120; // Grade A+ bonus
    return {
      grade: "A+",
      fatPremiumUZS: fatBonus,
      snfPremiumUZS: snfBonus,
      acidityPenaltyUZS: 0,
      effectiveRatePerLiterUZS: effectiveRate,
      bonusPercentage: Math.round(((effectiveRate - baseSpotRateUZS) / baseSpotRateUZS) * 1000) / 10,
      isEligibleForBottling: true,
      notes: "Grade A+ Premium Raw Milk: Passes high-heat UHT processing standards.",
    };
  }

  // Grade A: Fat >= 3.6%, SNF >= 8.4%, Acidity 16 - 19°T
  if (fatPercent >= 3.6 && snfPercent >= 8.4 && acidityT <= 19.0) {
    const fatBonus = Math.max(0, Math.round((fatPercent - 3.6) * 300));
    const snfBonus = Math.max(0, Math.round((snfPercent - 8.5) * 350));
    const effectiveRate = baseSpotRateUZS + fatBonus + snfBonus;
    return {
      grade: "A",
      fatPremiumUZS: fatBonus,
      snfPremiumUZS: snfBonus,
      acidityPenaltyUZS: 0,
      effectiveRatePerLiterUZS: effectiveRate,
      bonusPercentage: Math.round(((effectiveRate - baseSpotRateUZS) / baseSpotRateUZS) * 1000) / 10,
      isEligibleForBottling: true,
      notes: "Grade A Standard Raw Milk: Accepted for fresh pasteurized drinking milk.",
    };
  }

  // Grade B: Acidity 19.1 - 21.0°T or Fat 3.2 - 3.5%
  const acidityDeduction = acidityT > 19.0 ? Math.round((acidityT - 19.0) * 150) : 0;
  const fatPenalty = fatPercent < 3.6 ? Math.round((3.6 - fatPercent) * 250) : 0;
  const effectiveRate = Math.max(2500, baseSpotRateUZS - acidityDeduction - fatPenalty);

  return {
    grade: "B",
    fatPremiumUZS: 0,
    snfPremiumUZS: 0,
    acidityPenaltyUZS: acidityDeduction + fatPenalty,
    effectiveRatePerLiterUZS: effectiveRate,
    bonusPercentage: Math.round(((effectiveRate - baseSpotRateUZS) / baseSpotRateUZS) * 1000) / 10,
    isEligibleForBottling: false,
    notes: "Grade B Processing Milk: Diverted for hard cheese, curd, or industrial drying.",
  };
}

// ==========================================
// GAP-24: Escrow Banking Settlement Engine
// ==========================================

export interface EscrowPolicy {
  depositAccountIban: string;
  clearingBank: "Agrobank" | "Central Bank of Uzbekistan" | "Apex Bank";
  lockEvent: "ORDER_CREATED" | "TANKER_DISPATCHED";
  disbursementTrigger: "GATE_TITRATION_PASS";
  disputeFreezeWindowHours: number;
}

export const PLATFORM_ESCROW_POLICY: EscrowPolicy = {
  depositAccountIban: "UZ89 AGRO 0000 9876 5432 1000",
  clearingBank: "Agrobank",
  lockEvent: "ORDER_CREATED",
  disbursementTrigger: "GATE_TITRATION_PASS",
  disputeFreezeWindowHours: 4,
};

// ==========================================
// GAP-25: Cold-Chain SLA & Breach Penalties
// ==========================================

export interface ColdChainEvaluation {
  status: "OPTIMAL" | "WARNING" | "CRITICAL_BREACH";
  currentTempC: number;
  isCompliant: boolean;
  penaltyDeductionPercent: number;
  recommendation: string;
}

export function evaluateColdChain(tempC: number, durationMinutesOutsideRange: number): ColdChainEvaluation {
  if (tempC >= 2.0 && tempC <= 4.0) {
    return {
      status: "OPTIMAL",
      currentTempC: tempC,
      isCompliant: true,
      penaltyDeductionPercent: 0,
      recommendation: "Optimal temperature maintained within 2.0°–4.0°C corridor.",
    };
  }

  if (tempC > 4.0 && tempC <= 6.0) {
    if (durationMinutesOutsideRange < 45) {
      return {
        status: "WARNING",
        currentTempC: tempC,
        isCompliant: true,
        penaltyDeductionPercent: 0,
        recommendation: "Minor thermal excursion (<45m). Refrigerator unit should boost cooling.",
      };
    }
    return {
      status: "WARNING",
      currentTempC: tempC,
      isCompliant: false,
      penaltyDeductionPercent: 5,
      recommendation: "Temperature 4°–6°C exceeded 45 mins. 5% logistics fee deduction applied to driver.",
    };
  }

  // > 6.0°C or < 1.0°C (Freezing risk)
  return {
    status: "CRITICAL_BREACH",
    currentTempC: tempC,
    isCompliant: false,
    penaltyDeductionPercent: 15,
    recommendation: "Critical cold-chain spike (>6.0°C). Mandatory gate titration required prior to intake.",
  };
}

// ==========================================
// GAP-26: Real-Time Notification & Alert Dispatch
// ==========================================

export interface PlatformNotification {
  id: string;
  recipientRole: "farmer" | "dairy" | "driver" | "admin";
  channel: "SMS" | "TELEGRAM" | "IN_APP";
  event: "BATCH_DISPATCHED" | "COLLECTION_COMPLETED" | "TITRATION_PASSED" | "ESCROW_RELEASED" | "DISPUTE_FILED";
  message: string;
  timestamp: string;
}

export function createPlatformAlert(
  role: "farmer" | "dairy" | "driver" | "admin",
  event: PlatformNotification["event"],
  details: { batchNumber: string; amountOrInfo?: string }
): PlatformNotification {
  const messages: Record<PlatformNotification["event"], string> = {
    BATCH_DISPATCHED: `Tanker dispatched for batch ${details.batchNumber}. Driver en route to farm.`,
    COLLECTION_COMPLETED: `Batch ${details.batchNumber} picked up successfully. In transit under 3.2°C cold chain.`,
    TITRATION_PASSED: `Gate laboratory titration passed for batch ${details.batchNumber}. Quality Grade A+ approved!`,
    ESCROW_RELEASED: `Bank escrow payout of ${details.amountOrInfo} UZS disbursed to your Agrobank account.`,
    DISPUTE_FILED: `Arbitration dispute filed for batch ${details.batchNumber}. Escrow frozen pending review.`,
  };

  return {
    id: `notif-${Date.now()}`,
    recipientRole: role,
    channel: role === "farmer" || role === "driver" ? "TELEGRAM" : "IN_APP",
    event,
    message: messages[event],
    timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
  };
}
