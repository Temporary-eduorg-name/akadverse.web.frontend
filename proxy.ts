import { NextRequest, NextResponse } from "next/server";

type RateLimitPolicy = {
  limit: number;
  windowMs: number;
};

type RateLimitRecord = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateLimitRecord>();

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  return req.headers.get("x-real-ip") || "unknown";
}

function normalizeRouteKey(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  return `/${segments.slice(0, 5).join("/")}`;
}

function getPolicy(req: NextRequest): RateLimitPolicy {
  const { pathname } = req.nextUrl;
  const method = req.method.toUpperCase();

  if (pathname.startsWith("/api/auth") || pathname.startsWith("/api/email/connect") || pathname.startsWith("/api/email/callback")) {
    return { limit: 30, windowMs: 60_000 };
  }

  if (pathname.startsWith("/api/marketplace/admin")) {
    return { limit: 45, windowMs: 60_000 };
  }

  if (pathname.startsWith("/api/marketplace/payment") || pathname.startsWith("/api/marketplace/orders") || pathname.startsWith("/api/marketplace/cart")) {
    return { limit: 80, windowMs: 60_000 };
  }

  if (pathname.startsWith("/api/marketplace/realtime/events")) {
    return { limit: 150, windowMs: 60_000 };
  }

  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return { limit: 240, windowMs: 60_000 };
  }

  return { limit: 120, windowMs: 60_000 };
}

function cleanupExpiredRecords(now: number) {
  if (rateLimitStore.size < 2000) {
    return;
  }

  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}

export function proxy(req: NextRequest) {
  const now = Date.now();
  cleanupExpiredRecords(now);

  const policy = getPolicy(req);
  const ip = getClientIp(req);
  const routeKey = normalizeRouteKey(req.nextUrl.pathname);
  const key = `${ip}:${req.method.toUpperCase()}:${routeKey}`;

  const current = rateLimitStore.get(key);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + policy.windowMs,
    });

    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Limit", String(policy.limit));
    response.headers.set("X-RateLimit-Remaining", String(policy.limit - 1));
    response.headers.set("X-RateLimit-Reset", String(Math.ceil((now + policy.windowMs) / 1000)));
    return response;
  }

  if (current.count >= policy.limit) {
    const retryAfterSeconds = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
    return NextResponse.json(
      {
        error: "Too many requests. Please retry later.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSeconds),
          "X-RateLimit-Limit": String(policy.limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(current.resetAt / 1000)),
        },
      },
    );
  }

  current.count += 1;
  rateLimitStore.set(key, current);

  const response = NextResponse.next();
  response.headers.set("X-RateLimit-Limit", String(policy.limit));
  response.headers.set("X-RateLimit-Remaining", String(Math.max(0, policy.limit - current.count)));
  response.headers.set("X-RateLimit-Reset", String(Math.ceil(current.resetAt / 1000)));
  return response;
}

export const config = {
  matcher: ["/api/:path*"],
};