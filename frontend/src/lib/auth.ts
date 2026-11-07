/**
 * Central Frontend Authentication Layer
 * 
 * Manages JWT tokens, session state, user profiles, and API calls for:
 * - Credential sign-in (phone/email + password)
 * - SMS OTP authentication
 * - Role-based public registration (Farmer, Dairy, Driver)
 * - Session invalidation & sign-out
 */

import { RoleKey, mapBackendRoleToCanonicalRole, getDashboardPathForRole } from "./roles";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  truckPlate?: string;
  emailVerified: boolean;
}

export interface AuthOrganization {
  id: string;
  role: string;
  legalName: string;
  kybStatus: "VERIFIED" | "INCOMPLETE" | "PENDING" | "REJECTED";
  kybReviewNote?: string;
}

export interface AuthSession {
  user: AuthUser;
  organization: AuthOrganization;
  canonicalRole: RoleKey;
  dashboardPath: string;
  accessToken?: string;
}

const STORAGE_KEY = "zaminflow_session";
const TOKEN_KEY = "zaminflow_jwt";
const ROLE_COOKIE_KEY = "zaminflow_role";

export function getStoredSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveSession(session: AuthSession, keepSignedIn: boolean = true) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    if (session.accessToken) {
      localStorage.setItem(TOKEN_KEY, session.accessToken);
    }
    // Also set a client-accessible cookie for Next.js middleware guards
    const maxAge = keepSignedIn ? 7 * 86400 : 86400;
    document.cookie = `${ROLE_COOKIE_KEY}=${session.canonicalRole}; path=/; max-age=${maxAge}; SameSite=Lax`;
    document.cookie = `zaminflow_logged_in=true; path=/; max-age=${maxAge}; SameSite=Lax`;
  } catch (e) {
    console.error("Failed to save auth session", e);
  }
}

export function clearSession() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
    document.cookie = `${ROLE_COOKIE_KEY}=; path=/; max-age=0; SameSite=Lax`;
    document.cookie = `zaminflow_logged_in=; path=/; max-age=0; SameSite=Lax`;
    document.cookie = `access_token=; path=/; max-age=0; SameSite=Lax`;
  } catch (e) {
    console.error("Failed to clear auth session", e);
  }
}

/**
 * Sign In with Phone or Email + Password
 */
export async function signIn(
  identifier: string,
  password: string,
  keepSignedIn: boolean = true
): Promise<AuthSession> {
  const res = await fetch("/api/v1/auth/sign-in", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (res.status === 429) {
      throw new Error("LOCKED_OUT");
    }
    throw new Error(err.detail || "INVALID_CREDENTIALS");
  }

  const data = await res.json();
  const canonicalRole: RoleKey =
    data.canonical_role || mapBackendRoleToCanonicalRole(data.organization?.role);
  const dashboardPath = data.dashboard_path || getDashboardPathForRole(canonicalRole);

  const session: AuthSession = {
    user: {
      id: data.user?.id,
      email: data.user?.email,
      fullName: data.user?.full_name,
      phoneNumber: data.user?.phone_number,
      truckPlate: data.user?.truck_plate,
      emailVerified: !!data.user?.email_verified,
    },
    organization: {
      id: data.organization?.id,
      role: data.organization?.role,
      legalName: data.organization?.legal_name,
      kybStatus: data.organization?.kyb_status || "INCOMPLETE",
      kybReviewNote: data.organization?.kyb_review_note,
    },
    canonicalRole,
    dashboardPath,
    accessToken: data.access_token,
  };

  saveSession(session, keepSignedIn);
  return session;
}

/**
 * Sign Up with Role Selection
 */
export interface SignUpPayload {
  role: RoleKey;
  fullName: string;
  roleSpecificField: string;
  phone: string;
  email: string;
  region: string;
  password: string;
}

export async function signUp(payload: SignUpPayload): Promise<AuthSession> {
  let backendRole = "FARMER";
  let truckPlate: string | undefined = undefined;
  let organizationName: string | undefined = payload.roleSpecificField;

  if (payload.role === "dairy") {
    backendRole = "INDUSTRY";
  } else if (payload.role === "driver") {
    backendRole = "DRIVER";
    truckPlate = payload.roleSpecificField;
    organizationName = `Driver Fleet - ${payload.fullName}`;
  }

  const res = await fetch("/api/v1/auth/sign-up", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      role: backendRole,
      full_name: payload.fullName,
      organization_name: organizationName,
      phone_number: payload.phone,
      truck_plate: truckPlate,
      region: payload.region,
      email: payload.email,
      password: payload.password,
      accepted_terms: true,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (res.status === 409 || err.detail === "EMAIL_TAKEN") {
      throw new Error("EMAIL_TAKEN");
    }
    throw new Error(err.detail || "SIGN_UP_FAILED");
  }

  const data = await res.json();
  const canonicalRole: RoleKey =
    data.canonical_role
      ? mapBackendRoleToCanonicalRole(data.canonical_role)
      : data.role
      ? mapBackendRoleToCanonicalRole(data.role)
      : payload.role;
  const dashboardPath = data.dashboard_path || getDashboardPathForRole(canonicalRole);

  const session: AuthSession = {
    user: {
      id: data.user_id,
      email: data.email,
      fullName: payload.fullName,
      phoneNumber: payload.phone,
      truckPlate,
      emailVerified: false,
    },
    organization: {
      id: data.organization_id,
      role: data.role,
      legalName: organizationName || payload.fullName,
      kybStatus: "INCOMPLETE",
    },
    canonicalRole,
    dashboardPath,
    accessToken: data.access_token,
  };

  saveSession(session, true);
  return session;
}

/**
 * SMS OTP Flow
 */
export async function sendSmsOtp(phoneNumber: string): Promise<{ expiresIn: number; hint?: string }> {
  const res = await fetch("/api/v1/auth/sms/send-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone_number: phoneNumber }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "SMS_SEND_FAILED");
  }

  const data = await res.json();
  return { expiresIn: data.expires_in || 300, hint: data.hint };
}

export async function verifySmsOtp(phoneNumber: string, code: string): Promise<AuthSession> {
  const res = await fetch("/api/v1/auth/sms/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone_number: phoneNumber, code }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (res.status === 429) throw new Error("MAX_ATTEMPTS_EXCEEDED");
    throw new Error(err.detail || "INVALID_SMS_CODE");
  }

  const data = await res.json();
  const canonicalRole: RoleKey =
    data.canonical_role || mapBackendRoleToCanonicalRole(data.organization?.role);
  const dashboardPath = data.dashboard_path || getDashboardPathForRole(canonicalRole);

  const session: AuthSession = {
    user: {
      id: data.user?.id,
      email: data.user?.email,
      fullName: data.user?.full_name,
      phoneNumber: data.user?.phone_number,
      truckPlate: data.user?.truck_plate,
      emailVerified: !!data.user?.email_verified,
    },
    organization: {
      id: data.organization?.id,
      role: data.organization?.role,
      legalName: data.organization?.legal_name,
      kybStatus: data.organization?.kyb_status || "INCOMPLETE",
      kybReviewNote: data.organization?.kyb_review_note,
    },
    canonicalRole,
    dashboardPath,
    accessToken: data.access_token,
  };

  saveSession(session, true);
  return session;
}

/**
 * Silent Refresh Token
 */
export async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await fetch("/api/v1/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.access_token) {
      if (typeof window !== "undefined") {
        localStorage.setItem(TOKEN_KEY, data.access_token);
        const session = getStoredSession();
        if (session) {
          session.accessToken = data.access_token;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
        }
      }
      return data.access_token;
    }
  } catch (err) {
    console.warn("Silent token refresh failed", err);
  }
  return null;
}

/**
 * Authenticated Fetch with Silent Auto-Refresh Interceptor
 */
export async function authenticatedFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const session = getStoredSession();
  const headers = new Headers(init.headers || {});

  if (session?.accessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${session.accessToken}`);
  }

  const response = await fetch(input, { ...init, headers });

  // If 401 Unauthorized, attempt a silent token refresh and retry once
  if (response.status === 401 && typeof window !== "undefined") {
    const newAccessToken = await refreshAccessToken();
    if (newAccessToken) {
      headers.set("Authorization", `Bearer ${newAccessToken}`);
      return await fetch(input, { ...init, headers });
    } else {
      // Refresh expired, clear session
      clearSession();
    }
  }

  return response;
}

/**
 * Sign Out
 */
export async function signOut(): Promise<void> {
  try {
    await fetch("/api/v1/auth/sign-out", { method: "POST" });
  } catch {}
  clearSession();
}
