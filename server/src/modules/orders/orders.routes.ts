/**
 * Orders Routes
 *
 * Defines HTTP routes for order operations.
 *
 * Public endpoints:
 * - POST /orders                     - Create order (cart checkout)
 *
 * Admin endpoints:
 * - GET    /orders/admin              - List all orders (paginated, filterable)
 * - PATCH  /orders/admin/bulk-status  - Bulk update order statuses
 * - GET    /orders/admin/:id          - Get single order with items
 * - PATCH  /orders/admin/:id/status   - Update order status
 * - DELETE /orders/admin/:id          - Delete an order
 */

import type { FastifyInstance } from 'fastify';
import { ordersController } from './orders.controller.js';
import { authenticate, authorize } from '@libs/auth.js';
import { RATE_LIMITS } from '@config/rate-limit.config.js';

export async function ordersRoutes(fastify: FastifyInstance): Promise<void> {
  // ── Public Endpoints ──────────────────────────────────

  fastify.post(
    '/orders',
    {
      config: {
        rateLimit: { max: 10, timeWindow: '1 minute' },
      },
    },
    ordersController.create.bind(ordersController),
  );

  // ── Admin Endpoints ───────────────────────────────────
  // NOTE: /orders/admin* must come BEFORE /orders/:id
  // to avoid the :id param matching "admin"

  fastify.get(
    '/orders/admin',
    {
      preValidation: [authenticate, authorize('ADMIN')],
      config: {
        rateLimit: RATE_LIMITS.ADMIN_DEFAULT,
      },
    },
    ordersController.getAll.bind(ordersController),
  );

  fastify.patch(
    '/orders/admin/bulk-status',
    {
      preValidation: [authenticate, authorize('ADMIN')],
      config: {
        rateLimit: RATE_LIMITS.ADMIN_DEFAULT,
      },
    },
    ordersController.bulkUpdateStatus.bind(ordersController),
  );

  fastify.get(
    '/orders/admin/:id',
    {
      preValidation: [authenticate, authorize('ADMIN')],
      config: {
        rateLimit: RATE_LIMITS.ADMIN_DEFAULT,
      },
    },
    ordersController.getById.bind(ordersController),
  );

  fastify.patch(
    '/orders/admin/:id/status',
    {
      preValidation: [authenticate, authorize('ADMIN')],
      config: {
        rateLimit: RATE_LIMITS.ADMIN_DEFAULT,
      },
    },
    ordersController.updateStatus.bind(ordersController),
  );

  fastify.post(
    '/orders/admin/:id/notes',
    {
      preValidation: [authenticate, authorize('ADMIN')],
      config: {
        rateLimit: RATE_LIMITS.ADMIN_DEFAULT,
      },
    },
    ordersController.addNote.bind(ordersController),
  );

  fastify.delete(
    '/orders/admin/:id',
    {
      preValidation: [authenticate, authorize('ADMIN')],
      config: {
        rateLimit: RATE_LIMITS.ADMIN_DEFAULT,
      },
    },
    ordersController.delete.bind(ordersController),
  );
}
