/** Supabase Auth session adapter for the existing role-based UI. */
import { RoleKey, mapBackendRoleToCanonicalRole, getDashboardPathForRole } from "./roles";
import { createClient } from "./supabase/client";

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
  taxId?: string;
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

export function getStoredSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveSession(session: AuthSession) {
  if (typeof window !== "undefined") {
    const { accessToken: _token, ...safe } = session;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
  }
}

export function clearSession() {
  if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY);
}

async function loadAppSession(accessToken: string): Promise<AuthSession> {
  const response = await fetch("/api/v1/auth/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!response.ok) throw new Error("PROFILE_LOAD_FAILED");
  const data = await response.json();
  const canonicalRole = (data.canonical_role || mapBackendRoleToCanonicalRole(data.organization?.role)) as RoleKey;
  const session: AuthSession = {
    user: {
      id: data.user.id,
      email: data.user.email || "",
      fullName: data.user.full_name,
      phoneNumber: data.user.phone_number || undefined,
      emailVerified: !!data.user.email_verified,
    },
    organization: {
      id: data.organization.id,
      role: data.organization.role,
      legalName: data.organization.legal_name,
      kybStatus: data.organization.kyb_status || "INCOMPLETE",
      kybReviewNote: data.organization.kyb_review_note || undefined,
    },
    canonicalRole,
    dashboardPath: data.dashboard_path || getDashboardPathForRole(canonicalRole),
    accessToken,
  };
  saveSession(session);
  return session;
}

export async function signIn(identifier: string, password: string, _keepSignedIn = true): Promise<AuthSession> {
  const supabase = createClient();
  const result = await supabase.auth.signInWithPassword(
    identifier.includes("@") ? { email: identifier.trim().toLowerCase(), password } : { phone: identifier.trim(), password }
  );
  if (result.error || !result.data.session) throw new Error(result.error?.message || "INVALID_CREDENTIALS");
  return loadAppSession(result.data.session.access_token);
}

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
  if (!["farmer", "dairy", "driver"].includes(payload.role)) throw new Error("SIGN_UP_ROLE_NOT_ALLOWED");
  const role = payload.role === "dairy" ? "INDUSTRY" : payload.role.toUpperCase();
  const organizationName = payload.role === "driver" ? `Driver Fleet - ${payload.fullName}` : payload.roleSpecificField;
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email: payload.email.trim().toLowerCase(),
    password: payload.password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
      data: {
        role,
        full_name: payload.fullName.trim(),
        organization_name: organizationName,
        phone_number: payload.phone.trim(),
        truck_plate: payload.role === "driver" ? payload.roleSpecificField.trim() : null,
        region: payload.region,
      },
    },
  });
  if (error) {
    if (error.message.toLowerCase().includes("already registered")) throw new Error("EMAIL_TAKEN");
    throw new Error(error.message);
  }
  if (!data.session) throw new Error("EMAIL_CONFIRMATION_REQUIRED");
  return loadAppSession(data.session.access_token);
}

export async function sendSmsOtp(phoneNumber: string): Promise<{ expiresIn: number }> {
  const { error } = await createClient().auth.signInWithOtp({ phone: phoneNumber.trim() });
  if (error) throw new Error(error.message);
  return { expiresIn: 300 };
}

export async function verifySmsOtp(phoneNumber: string, code: string): Promise<AuthSession> {
  const { data, error } = await createClient().auth.verifyOtp({ phone: phoneNumber.trim(), token: code, type: "sms" });
  if (error || !data.session) throw new Error(error?.message || "INVALID_SMS_CODE");
  return loadAppSession(data.session.access_token);
}

export async function refreshAccessToken(): Promise<string | null> {
  const { data, error } = await createClient().auth.refreshSession();
  return error ? null : data.session?.access_token || null;
}

export async function authenticatedFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const supabase = createClient();
  let { data } = await supabase.auth.getSession();
  if (!data.session) {
    const refreshed = await supabase.auth.refreshSession();
    data = { session: refreshed.data.session };
  }
  if (!data.session) {
    clearSession();
    return new Response(JSON.stringify({ detail: "UNAUTHENTICATED" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${data.session.access_token}`);
  return fetch(input, { ...init, credentials: "same-origin", headers });
}

export async function signOut(): Promise<void> {
  await createClient().auth.signOut();
  clearSession();
}
