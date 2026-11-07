import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { sanitizeNextRedirect, RoleKey, mapBackendRoleToCanonicalRole } from "@/lib/roles";

function parseJwtPayload(token: string): { org_role?: string; sub_role?: string; exp?: number } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const jsonStr = Buffer.from(base64, "base64").toString("utf8");
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const accessTokenCookie =
    request.cookies.get("__Host-access_token")?.value ||
    request.cookies.get("access_token")?.value;

  let isAuthenticated = false;
  let userRole: RoleKey = "farmer";

  if (accessTokenCookie) {
    const payload = parseJwtPayload(accessTokenCookie);
    if (payload && (!payload.exp || payload.exp > Date.now() / 1000)) {
      isAuthenticated = true;
      const combined = `${payload.org_role || ""} ${payload.sub_role || ""}`;
      userRole = mapBackendRoleToCanonicalRole(combined);
    }
  }

  // Fallback to client-side cookie if running in development without JWT verification
  if (!isAuthenticated) {
    const roleCookie = request.cookies.get("zaminflow_role")?.value;
    const loggedInCookie = request.cookies.get("zaminflow_logged_in")?.value;
    if (loggedInCookie && roleCookie) {
      isAuthenticated = true;
      userRole = (roleCookie || "farmer") as RoleKey;
    }
  }

  // Role dashboard mapping
  const roleDashboardMap: Record<string, string> = {
    farmer: "/dashboard/farmer",
    dairy: "/dashboard/dairy",
    driver: "/dashboard/driver",
    admin: "/dashboard/admin",
  };
  const myDashboard = roleDashboardMap[userRole] || "/dashboard/farmer";

  // 1. Signed-in user opening /signin or /signup
  if (
    isAuthenticated &&
    (pathname === "/signin" ||
      pathname === "/sign-in" ||
      pathname === "/signup" ||
      pathname === "/sign-up" ||
      pathname === "/auth/login" ||
      pathname === "/auth/register")
  ) {
    const nextParam = request.nextUrl.searchParams.get("next");
    if (nextParam) {
      const safeDestination = sanitizeNextRedirect(nextParam, userRole);
      return NextResponse.redirect(new URL(safeDestination, request.url));
    }
    return NextResponse.redirect(new URL(myDashboard, request.url));
  }

  // 2. Route guards for /dashboard/*
  if (pathname.startsWith("/dashboard")) {
    // Unauthenticated users go to /signin?next=<path>
    if (!isAuthenticated) {
      const signInUrl = new URL("/signin", request.url);
      signInUrl.searchParams.set("next", pathname + search);
      return NextResponse.redirect(signInUrl);
    }

    // Direct /dashboard root -> redirect to role's dashboard
    if (pathname === "/dashboard" || pathname === "/dashboard/") {
      return NextResponse.redirect(new URL(myDashboard, request.url));
    }

    // Role-specific dashboard route checking
    if (userRole !== "admin") {
      // User opening another role's dashboard is redirected to their own dashboard
      if (
        (pathname.startsWith("/dashboard/farmer") && userRole !== "farmer") ||
        (pathname.startsWith("/dashboard/dairy") && userRole !== "dairy") ||
        (pathname.startsWith("/dashboard/driver") && userRole !== "driver") ||
        pathname.startsWith("/dashboard/admin")
      ) {
        return NextResponse.redirect(new URL(myDashboard, request.url));
      }
    }
  }

  // 3. Legacy Prototype Route Consolidation -> Redirect to Modern Artboard Dashboards
  if (
    pathname.startsWith("/farmer") ||
    pathname.startsWith("/industry") ||
    pathname.startsWith("/driver") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/bank")
  ) {
    if (pathname.startsWith("/farmer")) {
      return NextResponse.redirect(new URL("/dashboard/farmer", request.url));
    }
    if (pathname.startsWith("/industry")) {
      return NextResponse.redirect(new URL("/dashboard/dairy", request.url));
    }
    if (pathname.startsWith("/driver")) {
      return NextResponse.redirect(new URL("/dashboard/driver", request.url));
    }
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/dashboard/admin", request.url));
    }
    if (pathname.startsWith("/bank")) {
      return NextResponse.redirect(new URL("/dashboard/dairy/escrow", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/signin",
    "/sign-in",
    "/signup",
    "/sign-up",
    "/auth/login",
    "/auth/register",
    "/farmer/:path*",
    "/industry/:path*",
    "/driver/:path*",
    "/admin/:path*",
    "/bank/:path*",
  ],
};
