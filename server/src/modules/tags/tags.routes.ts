/**
 * Tags Routes
 *
 * Defines HTTP routes for tag operations.
 *
 * Public endpoints:
 * - GET /tags — List all tags (optional ?search= filter)
 *
 * Admin endpoints:
 * - POST   /tags      — Create tag
 * - PATCH  /tags/:id  — Update tag
 * - DELETE /tags/:id  — Delete tag
 */

import type { FastifyInstance } from 'fastify';
import { tagsController } from './tags.controller.js';
import { authenticate, authorize } from '@libs/auth.js';
import { RATE_LIMITS } from '@config/rate-limit.config.js';

export async function tagsRoutes(fastify: FastifyInstance): Promise<void> {
  // ── Public ────────────────────────────────────────────
  fastify.get(
    '/tags',
    {
      config: {
        rateLimit: { max: 60, timeWindow: '1 minute' },
      },
    },
    tagsController.getAll.bind(tagsController),
  );

  // ── Admin ─────────────────────────────────────────────
  fastify.post(
    '/tags',
    {
      preValidation: [authenticate, authorize('ADMIN')],
      config: {
        rateLimit: RATE_LIMITS.ADMIN_DEFAULT,
      },
    },
    tagsController.create.bind(tagsController),
  );

  fastify.patch(
    '/tags/:id',
    {
      preValidation: [authenticate, authorize('ADMIN')],
      config: {
        rateLimit: RATE_LIMITS.ADMIN_DEFAULT,
      },
    },
    tagsController.update.bind(tagsController),
  );

  fastify.delete(
    '/tags/:id',
    {
      preValidation: [authenticate, authorize('ADMIN')],
      config: {
        rateLimit: RATE_LIMITS.ADMIN_DEFAULT,
      },
    },
    tagsController.remove.bind(tagsController),
  );
}
