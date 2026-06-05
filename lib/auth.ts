import type { NextRequest } from 'next/server';
import type { ClientPrincipal } from './types';

/**
 * Extract authenticated user from SWA x-ms-client-principal header.
 * In development, returns a dev user unless guest mode cookie is set.
 */
export function getUserFromRequest(request: NextRequest): ClientPrincipal | null {
  if (process.env.NODE_ENV === 'development') {
    const devAuthState = request.cookies?.get('dev_auth_state')?.value;
    if (devAuthState === 'guest') return null;
    return {
      userId: 'dev-user',
      userDetails: 'dev@localhost',
      identityProvider: 'local',
      userRoles: ['authenticated'],
    };
  }

  const header = request.headers.get('x-ms-client-principal');
  if (!header) return null;

  try {
    const decoded = Buffer.from(header, 'base64').toString('utf8');
    return JSON.parse(decoded) as ClientPrincipal;
  } catch {
    return null;
  }
}
