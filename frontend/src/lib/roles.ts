/**
 * Central Role Configuration for ZaminFlow
 * 
 * WHO USES THE PLATFORM (four roles):
 * - Farmer: smallholder farmer or cooperative. Sells milk, sees live quality-based prices,
 *   tracks deliveries, quality results (fat, SNF, titration) and escrow payouts.
 * - Dairy Industry: commercial dairies and buyers. Orders milk, compares supply and prices,
 *   tracks shipments, funds escrow.
 * - Driver: transports milk between farms and dairies. Sees assigned pickups and deliveries,
 *   routes, cold-chain temperature, and confirms pickup and delivery.
 * - Admin: platform operators. Manage users, verification, pricing rules, disputes,
 *   escrow oversight, and platform analytics.
 */

export type RoleKey = "farmer" | "dairy" | "driver" | "admin";

export interface RoleConfig {
  key: RoleKey;
  label: string;
  backendRole: string; // Mapping to database/backend enum
  dashboardPath: string;
  allowedSelfSignup: boolean;
  roleFieldLabel: string;
  roleFieldPlaceholder: string;
  description: string;
}

export const ROLES: Record<RoleKey, RoleConfig> = {
  farmer: {
    key: "farmer",
    label: "Farmer",
    backendRole: "FARMER",
    dashboardPath: "/dashboard/farmer",
    allowedSelfSignup: true,
    roleFieldLabel: "Farm or cooperative name",
    roleFieldPlaceholder: "e.g. Baraka Agro Cooperative",
    description: "Sell raw milk, monitor quality tests, and receive escrow-guaranteed bank payouts.",
  },
  dairy: {
    key: "dairy",
    label: "Dairy Industry",
    backendRole: "INDUSTRY",
    dashboardPath: "/dashboard/dairy",
    allowedSelfSignup: true,
    roleFieldLabel: "Company name",
    roleFieldPlaceholder: "e.g. Toshkent Sut Kombinati LLC",
    description: "Procure verified raw milk at scale, inspect cold-chain shipments, and lock escrow.",
  },
  driver: {
    key: "driver",
    label: "Driver",
    backendRole: "DRIVER",
    dashboardPath: "/dashboard/driver",
    allowedSelfSignup: true,
    roleFieldLabel: "Vehicle plate number",
    roleFieldPlaceholder: "01 A 123 AA",
    description: "Transport insulated milk tankers with live GPS and telemetry temperature tracking.",
  },
  admin: {
    key: "admin",
    label: "Admin",
    backendRole: "ADMIN",
    dashboardPath: "/dashboard/admin",
    allowedSelfSignup: false,
    roleFieldLabel: "Department or unit",
    roleFieldPlaceholder: "Operations Oversight",
    description: "Platform operator overseeing KYC/KYB, dispute arbitration, and market liquidity.",
  },
};

/**
 * List of roles permitted for public self-signup
 */
export const PUBLIC_SIGNUP_ROLES: RoleConfig[] = Object.values(ROLES).filter(
  (role) => role.allowedSelfSignup
);

/**
 * Normalizes backend role names (e.g. "INDUSTRY", "INDUSTRY_OWNER", "DRIVER") to canonical RoleKey
 */
export function mapBackendRoleToCanonicalRole(backendRole?: string | null): RoleKey {
  if (!backendRole) return "farmer";
  const upper = backendRole.toUpperCase();

  if (upper.includes("ADMIN") || upper.includes("SUPERADMIN")) {
    return "admin";
  }
  if (upper.includes("DRIVER")) {
    return "driver";
  }
  if (upper.includes("INDUSTRY") || upper.includes("DAIRY")) {
    return "dairy";
  }
  if (upper.includes("FARMER")) {
    return "farmer";
  }
  return "farmer";
}

/**
 * Returns dashboard path for a given role
 */
export function getDashboardPathForRole(roleKey: RoleKey): string {
  return ROLES[roleKey]?.dashboardPath || "/dashboard/farmer";
}

/**
 * Checks if a path is permitted for a given role
 */
export function isPathAllowedForRole(path: string, roleKey: RoleKey): boolean {
  const config = ROLES[roleKey];
  if (!config) return false;

  // Strict check on path format: must start with / and not //, backslashes, or scheme
  if (
    !path.startsWith("/") ||
    path.startsWith("//") ||
    path.includes("\\") ||
    path.includes("://") ||
    /%2f/i.test(path) ||
    /%5c/i.test(path) ||
    /[\x00-\x1F\x7F]/.test(path)
  ) {
    return false;
  }

  // Admin has access to all dashboards under /dashboard
  if (roleKey === "admin") {
    return path.startsWith("/dashboard");
  }

  // Each role can access their own dashboard subpaths
  return path.startsWith(config.dashboardPath);
}

/**
 * Strict Open-Redirect Guard:
 * Accepts only a same-origin relative path starting with a single "/".
 * Strictly rejects protocol-relative "//", backslashes, encoded slashes/backslashes,
 * whitespace, control characters, and any external scheme or host.
 * Also verifies that the path is permitted for the authenticated user's role.
 * If invalid or unpermitted, returns the role's canonical dashboard path.
 */
export function sanitizeNextRedirect(
  nextParam: string | null | undefined,
  roleKey: RoleKey
): string {
  const fallbackDashboard = getDashboardPathForRole(roleKey);
  if (!nextParam || typeof nextParam !== "string") {
    return fallbackDashboard;
  }

  const trimmed = nextParam.trim();

  // 1. Must start with a single "/" and never "//" (protocol-relative URL)
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return fallbackDashboard;
  }

  // 2. Reject backslashes, schemes, encoded variants
  if (
    trimmed.includes("\\") ||
    /%2f/i.test(trimmed) ||
    /%5c/i.test(trimmed) ||
    /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed) ||
    trimmed.includes("://")
  ) {
    return fallbackDashboard;
  }

  // 3. Reject control characters
  if (/[\x00-\x1F\x7F]/.test(trimmed)) {
    return fallbackDashboard;
  }

  // 4. Verify path is allowed for the user's role
  if (!isPathAllowedForRole(trimmed, roleKey)) {
    return fallbackDashboard;
  }

  return trimmed;
}
