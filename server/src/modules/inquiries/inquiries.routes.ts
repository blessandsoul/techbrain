/**
 * Inquiries Routes
 *
 * Defines HTTP routes for inquiry operations.
 *
 * Public endpoints:
 * - POST /inquiries                    - Submit a contact form inquiry
 *
 * Admin endpoints:
 * - GET    /inquiries/admin            - List all inquiries (paginated)
 * - DELETE /inquiries/admin/:id        - Delete an inquiry
 */

import type { FastifyInstance } from 'fastify';
import { inquiriesController } from './inquiries.controller.js';
import { authenticate, authorize } from '@libs/auth.js';
import { RATE_LIMITS } from '@config/rate-limit.config.js';

export async function inquiriesRoutes(fastify: FastifyInstance): Promise<void> {
  // ── Public Endpoints ──────────────────────────────────

  fastify.post(
    '/inquiries',
    {
      config: {
        rateLimit: { max: 10, timeWindow: '1 minute' },
      },
    },
    inquiriesController.create.bind(inquiriesController),
  );

  // ── Admin Endpoints ───────────────────────────────────

  fastify.get(
    '/inquiries/admin',
    {
      preValidation: [authenticate, authorize('ADMIN')],
      config: {
        rateLimit: RATE_LIMITS.ADMIN_DEFAULT,
      },
    },
    inquiriesController.getAll.bind(inquiriesController),
  );

  fastify.delete(
    '/inquiries/admin/:id',
    {
      preValidation: [authenticate, authorize('ADMIN')],
      config: {
        rateLimit: RATE_LIMITS.ADMIN_DEFAULT,
      },
    },
    inquiriesController.remove.bind(inquiriesController),
  );
}
