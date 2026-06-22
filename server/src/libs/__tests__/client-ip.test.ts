import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { FastifyRequest } from 'fastify';

// Mutable env mock so TRUST_CLOUDFLARE can be flipped per test.
// getClientIp reads env.TRUST_CLOUDFLARE at call-time, so mutating this object
// between calls is sufficient. vi.hoisted lets the (hoisted) vi.mock factory
// reference the object without a temporal-dead-zone error.
const { mockEnv } = vi.hoisted(() => ({ mockEnv: { TRUST_CLOUDFLARE: false } }));
vi.mock('@config/env.js', () => ({ env: mockEnv }));

// Import after the mock is registered.
import { getClientIp } from '../client-ip.js';

/**
 * Build a minimal FastifyRequest-shaped object. Only `headers` and `ip` are
 * read by getClientIp, so we cast a partial through unknown.
 */
function makeRequest(
  headers: Record<string, string | string[] | undefined>,
  ip = '10.0.0.1',
): FastifyRequest {
  return { headers, ip } as unknown as FastifyRequest;
}

describe('getClientIp', () => {
  beforeEach(() => {
    mockEnv.TRUST_CLOUDFLARE = false;
  });

  it('uses CF-Connecting-IP when TRUST_CLOUDFLARE is on', () => {
    mockEnv.TRUST_CLOUDFLARE = true;
    const req = makeRequest({ 'cf-connecting-ip': '203.0.113.7' });
    expect(getClientIp(req)).toBe('203.0.113.7');
  });

  it('ignores CF-Connecting-IP when TRUST_CLOUDFLARE is off (falls through to request.ip)', () => {
    const req = makeRequest({ 'cf-connecting-ip': '203.0.113.7' }, '198.51.100.5');
    expect(getClientIp(req)).toBe('198.51.100.5');
  });

  it('uses left-most X-Forwarded-For when CF header is absent (flag on)', () => {
    mockEnv.TRUST_CLOUDFLARE = true;
    const req = makeRequest({ 'x-forwarded-for': '203.0.113.50' });
    expect(getClientIp(req)).toBe('203.0.113.50');
  });

  it('uses X-Forwarded-For even when TRUST_CLOUDFLARE is off (XFF trusted regardless)', () => {
    const req = makeRequest({ 'x-forwarded-for': '203.0.113.60' }, '10.0.0.1');
    expect(getClientIp(req)).toBe('203.0.113.60');
  });

  it('takes the left-most hop of a multi-hop X-Forwarded-For chain', () => {
    const req = makeRequest({
      'x-forwarded-for': '203.0.113.9, 70.41.3.18, 150.172.238.178',
    });
    expect(getClientIp(req)).toBe('203.0.113.9');
  });

  it('trims surrounding whitespace from the X-Forwarded-For value', () => {
    const req = makeRequest({ 'x-forwarded-for': '  203.0.113.11  , 70.41.3.18' });
    expect(getClientIp(req)).toBe('203.0.113.11');
  });

  it('falls back to request.ip when X-Forwarded-For is not a valid IP', () => {
    const req = makeRequest({ 'x-forwarded-for': 'not-an-ip' }, '192.0.2.44');
    expect(getClientIp(req)).toBe('192.0.2.44');
  });

  it('falls back to request.ip when X-Forwarded-For is empty', () => {
    const req = makeRequest({ 'x-forwarded-for': '' }, '192.0.2.55');
    expect(getClientIp(req)).toBe('192.0.2.55');
  });

  it('handles X-Forwarded-For delivered as an array (uses first element)', () => {
    const req = makeRequest({ 'x-forwarded-for': ['203.0.113.77', '70.41.3.18'] });
    expect(getClientIp(req)).toBe('203.0.113.77');
  });

  it('prefers CF-Connecting-IP over X-Forwarded-For when both present (flag on)', () => {
    mockEnv.TRUST_CLOUDFLARE = true;
    const req = makeRequest({
      'cf-connecting-ip': '203.0.113.1',
      'x-forwarded-for': '198.51.100.2',
    });
    expect(getClientIp(req)).toBe('203.0.113.1');
  });

  it('falls through to X-Forwarded-For when CF-Connecting-IP is invalid (flag on)', () => {
    mockEnv.TRUST_CLOUDFLARE = true;
    const req = makeRequest({
      'cf-connecting-ip': 'garbage',
      'x-forwarded-for': '198.51.100.9',
    });
    expect(getClientIp(req)).toBe('198.51.100.9');
  });

  it('also accepts IPv6 literals from CF-Connecting-IP', () => {
    mockEnv.TRUST_CLOUDFLARE = true;
    const req = makeRequest({ 'cf-connecting-ip': '2001:db8::1' });
    expect(getClientIp(req)).toBe('2001:db8::1');
  });

  it('always returns a non-empty IP (no headers -> request.ip)', () => {
    const req = makeRequest({}, '172.16.5.5');
    expect(getClientIp(req)).toBe('172.16.5.5');
    expect(getClientIp(req)).not.toBe('');
  });
});
