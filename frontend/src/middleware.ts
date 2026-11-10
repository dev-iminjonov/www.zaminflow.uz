import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getDashboardPathForRole, mapBackendRoleToCanonicalRole, sanitizeNextRedirect, type RoleKey } from "@/lib/roles";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookies) {
          cookies.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );
  const { data: claimsData } = await supabase.auth.getClaims();
  const claims = claimsData?.claims;
  const signedIn = !!claims?.sub;
  const metadata = (claims?.app_metadata || {}) as Record<string, string>;
  const role = mapBackendRoleToCanonicalRole(`${metadata.org_role || ""} ${metadata.sub_role || ""}`) as RoleKey;
  const dashboard = getDashboardPathForRole(role);
  const { pathname, search } = request.nextUrl;
  const authPaths = ["/signin", "/sign-in", "/signup", "/sign-up", "/auth/login", "/auth/register"];

  if (signedIn && authPaths.includes(pathname)) {
    const target = sanitizeNextRedirect(request.nextUrl.searchParams.get("next"), role);
    return NextResponse.redirect(new URL(target || dashboard, request.url));
  }
  if (pathname.startsWith("/dashboard")) {
    if (!signedIn) {
      const url = new URL("/signin", request.url);
      url.searchParams.set("next", pathname + search);
      return NextResponse.redirect(url);
    }
    if (pathname === "/dashboard" || pathname === "/dashboard/") return NextResponse.redirect(new URL(dashboard, request.url));
    if (role !== "admin" && ((pathname.startsWith("/dashboard/farmer") && role !== "farmer") || (pathname.startsWith("/dashboard/dairy") && role !== "dairy") || (pathname.startsWith("/dashboard/driver") && role !== "driver") || (pathname.startsWith("/dashboard/bank") && role !== "bank") || pathname.startsWith("/dashboard/admin"))) {
      return NextResponse.redirect(new URL(dashboard, request.url));
    }
  }

  // Exact mappings for legacy portal/field routes to modern dashboard routes
  const exactLegacyMap: Record<string, string> = {
    "/gate-scanner": "/dashboard/dairy/receive-batch",
    "/gate-scanner/account": "/dashboard/dairy/profile",
    "/industry/gate-lab": "/dashboard/dairy/receive-batch",
    "/industry/contracts": "/dashboard/dairy/orders",
    "/industry/account": "/dashboard/dairy/profile",
    "/industry/profile": "/dashboard/dairy/profile",
    "/farmer/account": "/dashboard/farmer/profile",
    "/farmer/profile": "/dashboard/farmer/profile",
    "/farmer/qr-pickup": "/dashboard/farmer/deliveries",
    "/driver/account": "/dashboard/driver/profile",
    "/driver/profile": "/dashboard/driver/profile",
    "/driver/scan": "/dashboard/driver/confirm-pickup",
    "/driver/gate-handover": "/dashboard/driver/route",
    "/admin/account": "/dashboard/admin/profile",
    "/admin/profile": "/dashboard/admin/profile",
    "/admin/kyb-review": "/dashboard/admin/verification",
    "/admin/invitations": "/dashboard/admin/users",
    "/bank/account": "/dashboard/bank/profile",
    "/bank/profile": "/dashboard/bank/profile",
  };

  if (exactLegacyMap[pathname]) {
    return NextResponse.redirect(new URL(exactLegacyMap[pathname] + search, request.url));
  }

  // Prefix fallback for legacy routes
  const legacyPrefixes: Array<[string, string]> = [
    ["/gate-scanner", "/dashboard/dairy/receive-batch"],
    ["/farmer", "/dashboard/farmer"],
    ["/industry", "/dashboard/dairy"],
    ["/driver", "/dashboard/driver"],
    ["/admin", "/dashboard/admin"],
    ["/bank", "/dashboard/bank"],
  ];
  const legacyMatch = legacyPrefixes.find(([prefix]) => pathname.startsWith(prefix));
  if (legacyMatch) {
    return NextResponse.redirect(new URL(legacyMatch[1] + search, request.url));
  }

  return response;
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
    "/auth/callback",
    "/farmer/:path*",
    "/industry/:path*",
    "/driver/:path*",
    "/admin/:path*",
    "/bank/:path*",
    "/gate-scanner/:path*",
    "/gate-scanner",
  ],
};
