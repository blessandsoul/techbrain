/**
 * Client IP Resolution
 *
 * Behind a reverse proxy (Cloudflare / Traefik / Nginx), `request.ip` is the
 * proxy/edge IP, not the visitor's. Keying rate-limit and IP-block decisions on
 * that shared edge IP collapses every visitor onto one key — a handful of
 * violations then auto-blocks the whole site. This module resolves the real
 * client IP for those decisions.
 */

import { isIP } from 'node:net';
import type { FastifyRequest } from 'fastify';
import { env } from '@config/env.js';

/** Return the trimmed value if it is a valid IPv4/IPv6 literal, else undefined. */
function asValidIp(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  return isIP(trimmed) !== 0 ? trimmed : undefined;
}

/**
 * Resolve the real client IP for rate-limit / IP-block decisions.
 * Order: CF-Connecting-IP (when TRUST_CLOUDFLARE) -> left-most valid X-Forwarded-For -> request.ip.
 * SECURITY: CF/XFF are client-spoofable, so trustworthy ONLY when the origin accepts traffic
 * exclusively via the Cloudflare/Traefik proxy (origin firewall-locked) — a documented deploy precondition.
 */
export function getClientIp(request: FastifyRequest): string {
  if (env.TRUST_CLOUDFLARE) {
    const cfHeader = request.headers['cf-connecting-ip'];
    const cf = asValidIp(typeof cfHeader === 'string' ? cfHeader : undefined);
    if (cf) return cf;
  }
  const xffRaw = request.headers['x-forwarded-for'];
  const xff = typeof xffRaw === 'string' ? xffRaw : Array.isArray(xffRaw) ? xffRaw[0] : undefined;
  if (xff) {
    const leftMost = asValidIp(xff.split(',')[0]);
    if (leftMost) return leftMost;
  }
  return request.ip;
}
