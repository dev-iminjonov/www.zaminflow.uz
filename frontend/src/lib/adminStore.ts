/**
 * Admin Module State & Data Management
 *
 * Provides persistent state backing for:
 * - GAP-19: Users directory & permissions
 * - GAP-20: KYB verification queue
 * - GAP-21: Disputes arbitration tribunal
 * - GAP-22: Individual organization verification inspection
 */

export interface AdminUserRecord {
  id: string;
  fullName: string;
  legalName: string;
  role: "farmer" | "dairy" | "driver" | "admin";
  taxId: string;
  region: string;
  kybStatus: "VERIFIED" | "PENDING_VERIFICATION" | "REJECTED";
  isActive: boolean;
  registeredDate: string;
}

export interface KybDossier {
  id: string;
  applicantKey: string;
  organizationName: string;
  role: "Farmer" | "Dairy Industry" | "Driver";
  region: string;
  submittedTimeAgo: string;
  taxId: string;
  bankIban: string;
  directorName: string;
  status: "pending" | "approved" | "rejected";
  documents: Array<{ name: string; type: string; status: string }>;
}

export interface DisputeCase {
  id: string;
  caseNumber: string;
  batchNumber: string;
  claimantName: string;
  claimantRole: string;
  respondentName: string;
  respondentRole: string;
  frozenEscrowUZS: number;
  reason: string;
  filedDate: string;
  status: "open" | "settled_farmer" | "settled_split" | "settled_dairy";
}

export const INITIAL_ADMIN_USERS: AdminUserRecord[] = [
  {
    id: "8200ed1f-8209-4667-b6cb-30786fe571c5",
    fullName: "Iminjonov Muhammadaziz",
    legalName: "ZaminFlow Operations HQ",
    role: "admin",
    taxId: "304445566",
    region: "Tashkent",
    kybStatus: "VERIFIED",
    isActive: true,
    registeredDate: "08 Nov 2026",
  },
  {
    id: "1c51b7be-0ace-4230-9319-11305edca118",
    fullName: "Abdumanov Akrom",
    legalName: "ZaminFlow Operations HQ",
    role: "admin",
    taxId: "304445566",
    region: "Tashkent",
    kybStatus: "VERIFIED",
    isActive: true,
    registeredDate: "08 Nov 2026",
  },
  {
    id: "77b122c1-b022-469a-8b8a-81f5035a08c1",
    fullName: "Sevinçoy Soporboyeva",
    legalName: "ZaminFlow Operations HQ",
    role: "admin",
    taxId: "304445566",
    region: "Tashkent",
    kybStatus: "VERIFIED",
    isActive: true,
    registeredDate: "08 Nov 2026",
  },
];

export const INITIAL_KYB_DOSSIERS: KybDossier[] = [
  {
    id: "kyb-1",
    applicantKey: "Farmer-Andijan",
    organizationName: "Andijan Pure Farms XK",
    role: "Farmer",
    region: "Andijan",
    submittedTimeAgo: "Submitted 2 h ago",
    taxId: "308221445",
    bankIban: "UZ88 AGRO 0000 1111 2222 3333",
    directorName: "Erkin Toshmatov",
    status: "pending",
    documents: [
      { name: "State_Tax_Certificate_Guvohnoma.pdf", type: "TIN/Tax", status: "Verified on Soliq.uz" },
      { name: "Veterinary_Sanitary_Passport_2026.pdf", type: "Health", status: "Valid" },
      { name: "Agrobank_IBAN_Letter.pdf", type: "Banking", status: "Valid" },
    ],
  },
  {
    id: "kyb-2",
    applicantKey: "Dairy-Tashkent",
    organizationName: "Yangi Asr Dairy Processing Plant",
    role: "Dairy Industry",
    region: "Tashkent",
    submittedTimeAgo: "Submitted 5 h ago",
    taxId: "207889114",
    bankIban: "UZ45 NBU 0000 4444 5555 6666",
    directorName: "Shavkat Mirzayev",
    status: "pending",
    documents: [
      { name: "Industrial_Food_Safety_ISO22000.pdf", type: "Safety", status: "Valid" },
      { name: "Corporate_Registration_Certificate.pdf", type: "Corporate", status: "Verified on Soliq.uz" },
      { name: "Bank_Escrow_Account_Confirmation.pdf", type: "Banking", status: "Valid" },
    ],
  },
  {
    id: "kyb-3",
    applicantKey: "Driver-Samarqand",
    organizationName: "Samarqand Trans Cold Logistics MCHJ",
    role: "Driver",
    region: "Samarqand",
    submittedTimeAgo: "Submitted yesterday",
    taxId: "502331998",
    bankIban: "UZ12 HAMKOR 0000 7777 8888 9999",
    directorName: "Jasur Qosimov",
    status: "pending",
    documents: [
      { name: "Refrigerated_Tanker_Sanitation_Cert.pdf", type: "Sanitary", status: "Valid" },
      { name: "Driver_License_Category_CE.pdf", type: "License", status: "Valid" },
      { name: "Vehicle_Registration_Passport.pdf", type: "Vehicle", status: "Valid" },
    ],
  },
];

export const INITIAL_DISPUTE_CASES: DisputeCase[] = [];

const ADMIN_USERS_KEY = "zaminflow_admin_users_v2";
const KYB_KEY = "zaminflow_admin_kyb";
const DISPUTES_KEY = "zaminflow_admin_disputes";

export function getAdminUsers(): AdminUserRecord[] {
  if (typeof window === "undefined") return INITIAL_ADMIN_USERS;
  const stored = localStorage.getItem(ADMIN_USERS_KEY);
  if (!stored) {
    localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify(INITIAL_ADMIN_USERS));
    return INITIAL_ADMIN_USERS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_ADMIN_USERS;
  }
}

export function getKybDossiers(): KybDossier[] {
  if (typeof window === "undefined") return INITIAL_KYB_DOSSIERS;
  const stored = localStorage.getItem(KYB_KEY);
  if (!stored) {
    localStorage.setItem(KYB_KEY, JSON.stringify(INITIAL_KYB_DOSSIERS));
    return INITIAL_KYB_DOSSIERS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_KYB_DOSSIERS;
  }
}

export function updateKybDossierStatus(applicantKey: string, status: "approved" | "rejected"): KybDossier | null {
  const dossiers = getKybDossiers();
  const idx = dossiers.findIndex(
    (d) => d.applicantKey.toLowerCase() === applicantKey.toLowerCase()
  );
  if (idx === -1) return null;
  dossiers[idx].status = status;
  if (typeof window !== "undefined") {
    localStorage.setItem(KYB_KEY, JSON.stringify(dossiers));
  }
  return dossiers[idx];
}

export function getDisputeCases(): DisputeCase[] {
  if (typeof window === "undefined") return INITIAL_DISPUTE_CASES;
  const stored = localStorage.getItem(DISPUTES_KEY);
  if (!stored) {
    localStorage.setItem(DISPUTES_KEY, JSON.stringify(INITIAL_DISPUTE_CASES));
    return INITIAL_DISPUTE_CASES;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_DISPUTE_CASES;
  }
}

export function resolveDispute(caseId: string, resolution: "settled_farmer" | "settled_split" | "settled_dairy"): void {
  const cases = getDisputeCases();
  const idx = cases.findIndex((c) => c.id === caseId);
  if (idx !== -1) {
    cases[idx].status = resolution;
    if (typeof window !== "undefined") {
      localStorage.setItem(DISPUTES_KEY, JSON.stringify(cases));
    }
  }
}
