import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// NOTE: We intentionally do NOT use a per-request nonce + 'strict-dynamic'
// because pages are statically prerendered. The prerendered HTML has no
// nonce on its script tags, so a per-request nonce in the CSP header would
// block ALL scripts (preventing React hydration). Instead we use a static
// CSP that allows self-hosted scripts and inline bootstrap scripts that
// Next.js injects at build time.
export function middleware(_request: NextRequest) {
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');

  const response = NextResponse.next();
  response.headers.set('Content-Security-Policy', csp);

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico).*)'],
};
