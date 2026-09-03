import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

/* ── Public routes that never need a token ─────────────────────────────── */
const PUBLIC_API_ROUTES = [
  '/api/v1/auth/login',
  '/api/v1/auth/register',
  '/api/v1/auth/forgot-password',
  '/api/v1/auth/reset-password',
  '/api/v1/auth/verify-email',
  // read-only public data consumed by the mobile app unauthenticated
  '/api/v1/alerts',
  '/api/v1/emergency-services',
  '/api/v1/safety-tips',
  '/api/v1/hotspots',
  '/api/v1/releases',
  '/api/v1/maps',
];

/* ── Admin-only API routes (require ADMIN role) ─────────────────────────── */
const ADMIN_API_PREFIXES = [
  '/api/v1/hotspots/recompute',
];

function isPublicApi(pathname: string): boolean {
  return PUBLIC_API_ROUTES.some((pub) => pathname === pub || pathname.startsWith(pub + '/') || pathname.startsWith(pub + '?'));
}

function setCorsHeaders(response: NextResponse, origin: string | null) {
  if (origin) response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Methods', 'GET,POST,PATCH,PUT,DELETE,OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Vary', 'Origin');
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get('origin');

  /* ── CORS preflight ──────────────────────────────────────────────────── */
  if (request.method === 'OPTIONS') {
    const res = new NextResponse(null, { status: 204 });
    setCorsHeaders(res, origin);
    return res;
  }

  /* ── Admin page protection ───────────────────────────────────────────── */
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    // Middleware runs on the Edge runtime, which cannot access localStorage.
    // The token lives in localStorage (set by the login page), so we cannot
    // read it here. We guard with a lightweight client-side redirect instead —
    // see AdminLayoutShell which checks the token on every mount. The real
    // protection is the API layer: every sensitive API route verifies the
    // Bearer token server-side, so an unauthenticated visitor can load the
    // HTML shell but gets no data at all.
    return NextResponse.next();
  }

  /* ── API auth enforcement ────────────────────────────────────────────── */
  if (pathname.startsWith('/api/')) {
    const res = NextResponse.next();
    setCorsHeaders(res, origin);

    // Let public endpoints through without a token.
    if (isPublicApi(pathname)) return res;

    // Every other /api/ route requires a valid JWT.
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      const err = NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      setCorsHeaders(err, origin);
      return err;
    }

    const payload = verifyToken(token);
    if (!payload) {
      const err = NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
      setCorsHeaders(err, origin);
      return err;
    }

    // Routes that require ADMIN role.
    const needsAdmin = ADMIN_API_PREFIXES.some((p) => pathname.startsWith(p));
    if (needsAdmin && payload.role !== 'ADMIN') {
      const err = NextResponse.json({ error: 'Admin access required' }, { status: 403 });
      setCorsHeaders(err, origin);
      return err;
    }

    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/:path*',
  ],
};
