/**
 * Site Settings Routes
 *
 * Public endpoints:
 * - GET  /site-settings  - Get all site settings
 *
 * Admin endpoints:
 * - PUT  /site-settings  - Update site settings (deep merge)
 */

import type { FastifyInstance } from 'fastify';
import { siteSettingsController } from './site-settings.controller.js';
import { authenticate, authorize } from '@libs/auth.js';
import { RATE_LIMITS } from '@config/rate-limit.config.js';

export async function siteSettingsRoutes(fastify: FastifyInstance): Promise<void> {
  // ── Public ────────────────────────────────────────

  fastify.get(
    '/site-settings',
    {
      config: {
        rateLimit: { max: 60, timeWindow: '1 minute' },
      },
    },
    siteSettingsController.getSettings.bind(siteSettingsController),
  );

  // ── Admin ─────────────────────────────────────────

  fastify.put(
    '/site-settings',
    {
      preValidation: [authenticate, authorize('ADMIN')],
      config: {
        rateLimit: RATE_LIMITS.ADMIN_DEFAULT,
      },
    },
    siteSettingsController.updateSettings.bind(siteSettingsController),
  );
}
