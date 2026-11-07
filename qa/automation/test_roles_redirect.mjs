import test from "node:test";
import assert from "node:assert/strict";

// Replicate or import sanitizeNextRedirect logic to test edge cases
function isPathAllowedForRole(path, roleKey) {
  const config = {
    farmer: { dashboardPath: "/dashboard/farmer" },
    dairy: { dashboardPath: "/dashboard/dairy" },
    driver: { dashboardPath: "/dashboard/driver" },
    admin: { dashboardPath: "/dashboard/admin" },
  }[roleKey];
  if (!config) return false;

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

  if (roleKey === "admin") {
    return path.startsWith("/dashboard");
  }

  return path.startsWith(config.dashboardPath);
}

function sanitizeNextRedirect(nextParam, roleKey) {
  const fallbackDashboard = {
    farmer: "/dashboard/farmer",
    dairy: "/dashboard/dairy",
    driver: "/dashboard/driver",
    admin: "/dashboard/admin",
  }[roleKey] || "/dashboard/farmer";

  if (!nextParam || typeof nextParam !== "string") {
    return fallbackDashboard;
  }

  const trimmed = nextParam.trim();

  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return fallbackDashboard;
  }

  if (
    trimmed.includes("\\") ||
    /%2f/i.test(trimmed) ||
    /%5c/i.test(trimmed) ||
    /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed) ||
    trimmed.includes("://")
  ) {
    return fallbackDashboard;
  }

  if (/[\x00-\x1F\x7F]/.test(trimmed)) {
    return fallbackDashboard;
  }

  if (!isPathAllowedForRole(trimmed, roleKey)) {
    return fallbackDashboard;
  }

  return trimmed;
}

test("QA-002: Rejects external URLs for admin and redirects to /dashboard/admin", () => {
  assert.equal(sanitizeNextRedirect("https://evil.com", "admin"), "/dashboard/admin");
  assert.equal(sanitizeNextRedirect("http://evil.com", "admin"), "/dashboard/admin");
  assert.equal(sanitizeNextRedirect("//evil.com", "admin"), "/dashboard/admin");
  assert.equal(sanitizeNextRedirect("///evil.com", "admin"), "/dashboard/admin");
  assert.equal(sanitizeNextRedirect("javascript:alert(1)", "admin"), "/dashboard/admin");
  assert.equal(sanitizeNextRedirect("data:text/html,<script>alert(1)</script>", "admin"), "/dashboard/admin");
  assert.equal(sanitizeNextRedirect("vbscript:msgbox(1)", "admin"), "/dashboard/admin");
});

test("QA-002: Rejects backslashes, control characters, and encoded slashes", () => {
  assert.equal(sanitizeNextRedirect("/\\evil.com", "admin"), "/dashboard/admin");
  assert.equal(sanitizeNextRedirect("/%2fevil.com", "admin"), "/dashboard/admin");
  assert.equal(sanitizeNextRedirect("/%5cevil.com", "admin"), "/dashboard/admin");
  assert.equal(sanitizeNextRedirect("/dashboard\x00/admin", "admin"), "/dashboard/admin");
  assert.equal(sanitizeNextRedirect("/dashboard\x1b/admin", "admin"), "/dashboard/admin");
  assert.equal(sanitizeNextRedirect("/dashboard\x7f/admin", "admin"), "/dashboard/admin");
});

test("QA-002: Restricts cross-role access", () => {
  assert.equal(sanitizeNextRedirect("/dashboard/farmer", "dairy"), "/dashboard/dairy");
  assert.equal(sanitizeNextRedirect("/dashboard/driver", "farmer"), "/dashboard/farmer");
  assert.equal(sanitizeNextRedirect("/dashboard/admin", "driver"), "/dashboard/driver");
});

test("QA-002: Allows valid relative paths for appropriate roles", () => {
  assert.equal(sanitizeNextRedirect("/dashboard/farmer/payouts", "farmer"), "/dashboard/farmer/payouts");
  assert.equal(sanitizeNextRedirect("/dashboard/dairy/orders", "dairy"), "/dashboard/dairy/orders");
  assert.equal(sanitizeNextRedirect("/dashboard/driver/my-trips", "driver"), "/dashboard/driver/my-trips");
  assert.equal(sanitizeNextRedirect("/dashboard/admin/disputes", "admin"), "/dashboard/admin/disputes");
});
