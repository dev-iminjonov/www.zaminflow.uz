import { NextRequest, NextResponse } from "next/server";

// In production the FastAPI service must be explicitly hosted and configured.
// Local Docker candidates are available only for local development.
const BACKEND_CANDIDATES = [
  process.env.BACKEND_URL,
  ...(process.env.NODE_ENV === "production" ? [] : [process.env.INTERNAL_BACKEND_URL, "http://backend:8000", "http://dairy_backend:8000", "http://127.0.0.1:8000", "http://localhost:8000"]),
].filter(Boolean) as string[];

// Edge IP Rate Limiter for Sensitive Auth Endpoints (e.g. sign-in brute-force protection)
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 60 seconds
const MAX_SIGN_IN_ATTEMPTS = 20;

function checkRateLimit(ip: string, pathStr: string): boolean {
  if (!pathStr.includes("auth/sign-in")) return true;
  
  const now = Date.now();
  const key = `${ip}:${pathStr}`;
  const timestamps = rateLimitMap.get(key) || [];
  
  const activeTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (activeTimestamps.length >= MAX_SIGN_IN_ATTEMPTS) {
    rateLimitMap.set(key, activeTimestamps);
    return false;
  }
  
  activeTimestamps.push(now);
  rateLimitMap.set(key, activeTimestamps);
  return true;
}

/**
 * Clean Reverse Proxy Handler:
 * Strictly forwards requests to upstream FastAPI backend, preserving status codes,
 * headers, Set-Cookie headers, and bodies. Never creates local fallback accounts or sessions.
 */
async function proxyRequest(req: NextRequest, pathStr: string, bodyText?: string) {
  if (BACKEND_CANDIDATES.length === 0) {
    return NextResponse.json({ detail: "Backend service is not configured." }, { status: 503 });
  }
  const search = req.nextUrl.search;
  let lastError: any = null;

  for (const base of BACKEND_CANDIDATES) {
    try {
      const targetUrl = `${base}/api/${pathStr}${search}`;
      const forwardHeaders = new Headers();

      req.headers.forEach((val, key) => {
        const lowerKey = key.toLowerCase();
        if (!["host", "connection", "content-length"].includes(lowerKey)) {
          forwardHeaders.set(key, val);
        }
      });

      const options: RequestInit = {
        method: req.method,
        headers: forwardHeaders,
        signal: AbortSignal.timeout(6000),
      };

      if (!["GET", "HEAD"].includes(req.method) && bodyText !== undefined && bodyText !== "") {
        options.body = bodyText;
      }

      const res = await fetch(targetUrl, options);
      const resBody = await res.arrayBuffer();

      const responseHeaders = new Headers();
      res.headers.forEach((v, k) => {
        if (k.toLowerCase() !== "set-cookie") {
          responseHeaders.set(k, v);
        }
      });

      // Preserve all Set-Cookie headers from backend
      const setCookies = typeof (res.headers as any).getSetCookie === "function"
        ? (res.headers as any).getSetCookie()
        : null;

      if (Array.isArray(setCookies) && setCookies.length > 0) {
        setCookies.forEach((cookieStr: string) => {
          responseHeaders.append("set-cookie", cookieStr);
        });
      } else {
        const rawSetCookie = res.headers.get("set-cookie");
        if (rawSetCookie) {
          responseHeaders.set("set-cookie", rawSetCookie);
        }
      }

      return new NextResponse(resBody, {
        status: res.status,
        headers: responseHeaders,
      });
    } catch (err) {
      lastError = err;
      // Continue to next candidate
    }
  }

  // If all backend candidates failed to respond, return 503 Service Unavailable
  return NextResponse.json(
    {
      detail: "Backend service unavailable. Please try again later.",
    },
    { status: 503 }
  );
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const pathStr = path.join("/");

  // Rate limit protection on sign-in
  const forwarded = req.headers.get("x-forwarded-for");
  const clientIp = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";
  if (!checkRateLimit(clientIp, pathStr)) {
    return NextResponse.json(
      { detail: "Too many sign-in attempts. Please wait 60 seconds before trying again." },
      {
        status: 429,
        headers: { "Retry-After": "60" },
      }
    );
  }

  const bodyText = await req.text();
  return proxyRequest(req, pathStr, bodyText);
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const pathStr = path.join("/");
  return proxyRequest(req, pathStr);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const pathStr = path.join("/");
  const bodyText = await req.text();
  return proxyRequest(req, pathStr, bodyText);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const pathStr = path.join("/");
  const bodyText = await req.text();
  return proxyRequest(req, pathStr, bodyText);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const pathStr = path.join("/");
  return proxyRequest(req, pathStr);
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
