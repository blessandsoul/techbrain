import type { FastifyReply } from 'fastify';
import { env } from '@config/env.js';
import { parseDurationMs } from '@libs/auth.js';

const isProduction = env.NODE_ENV === 'production';

// Cross-origin (API on different subdomain) requires 'none' + secure
// Same-origin can use 'strict' for tighter security
const sameSite = isProduction ? 'none' as const : 'lax' as const;
const cookieDomain = env.COOKIE_DOMAIN || undefined;

const ACCESS_TOKEN_MAX_AGE_MS = parseDurationMs(env.JWT_ACCESS_EXPIRY, 15 * 60 * 1000);
const REFRESH_TOKEN_MAX_AGE_MS = parseDurationMs(env.JWT_REFRESH_EXPIRY, 7 * 24 * 60 * 60 * 1000);

export function setAuthCookies(
  reply: FastifyReply,
  accessToken: string,
  refreshToken: string,
): void {
  reply.setCookie('access_token', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite,
    domain: cookieDomain,
    path: '/',
    maxAge: Math.floor(ACCESS_TOKEN_MAX_AGE_MS / 1000),
  });

  reply.setCookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite,
    domain: cookieDomain,
    path: '/api/v1/auth',
    maxAge: Math.floor(REFRESH_TOKEN_MAX_AGE_MS / 1000),
  });

  // Non-httpOnly session indicator cookie — readable by Next.js middleware
  // to distinguish "access token expired but session alive" from "not logged in"
  reply.setCookie('auth_session', '1', {
    httpOnly: false,
    secure: isProduction,
    sameSite,
    domain: cookieDomain,
    path: '/',
    maxAge: Math.floor(REFRESH_TOKEN_MAX_AGE_MS / 1000),
  });
}

export function clearAuthCookies(reply: FastifyReply): void {
  reply.clearCookie('access_token', {
    httpOnly: true,
    secure: isProduction,
    sameSite,
    domain: cookieDomain,
    path: '/',
  });

  reply.clearCookie('refresh_token', {
    httpOnly: true,
    secure: isProduction,
    sameSite,
    domain: cookieDomain,
    path: '/api/v1/auth',
  });

  reply.clearCookie('auth_session', {
    httpOnly: false,
    secure: isProduction,
    sameSite,
    domain: cookieDomain,
    path: '/',
  });
}
