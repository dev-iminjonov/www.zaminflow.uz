export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export function generateIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `idem-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export async function apiRequest<T = any>(
  path: string,
  options: RequestInit = {},
  requireIdempotency: boolean = false
): Promise<T> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("zaminflow_jwt")
      : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  if (requireIdempotency && !headers["Idempotency-Key"]) {
    headers["Idempotency-Key"] = generateIdempotencyKey();
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.detail || `API Error (${res.status})`);
  }
  return res.json();
}
