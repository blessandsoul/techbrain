/**
 * Articles Routes
 *
 * Defines HTTP routes for article/blog operations.
 *
 * Public endpoints:
 * - GET /articles              — Published articles (paginated, optional category filter)
 * - GET /articles/:slug        — Single published article by slug
 *
 * Admin endpoints:
 * - GET    /articles/admin            — All articles (paginated, admin)
 * - GET    /articles/admin/:id        — Single article by ID (admin)
 * - POST   /articles                  — Create article
 * - PATCH  /articles/:id              — Update article
 * - DELETE /articles/:id              — Delete article
 * - POST   /articles/:id/cover       — Upload cover image
 * - PATCH  /articles/:id/toggle-publish — Toggle publish state
 */

import type { FastifyInstance } from 'fastify';
import { articlesController } from './articles.controller.js';
import { authenticate, authorize } from '@libs/auth.js';
import { RATE_LIMITS } from '@config/rate-limit.config.js';

export async function articlesRoutes(fastify: FastifyInstance): Promise<void> {
  // ── Public Endpoints ────────────────────────────────

  fastify.get(
    '/articles',
    {
      config: {
        rateLimit: { max: 60, timeWindow: '1 minute' },
      },
    },
    articlesController.getPublished.bind(articlesController),
  );

  // NOTE: /articles/admin must come BEFORE /articles/:slug
  // to avoid the :slug param matching "admin"

  // ── Admin Endpoints ─────────────────────────────────

  fastify.get(
    '/articles/admin',
    {
      preValidation: [authenticate, authorize('ADMIN')],
      config: {
        rateLimit: RATE_LIMITS.ADMIN_DEFAULT,
      },
    },
    articlesController.getAll.bind(articlesController),
  );

  fastify.get(
    '/articles/admin/:id',
    {
      preValidation: [authenticate, authorize('ADMIN')],
      config: {
        rateLimit: RATE_LIMITS.ADMIN_DEFAULT,
      },
    },
    articlesController.getById.bind(articlesController),
  );

  // ── Public Single Article ───────────────────────────

  fastify.get(
    '/articles/:slug',
    {
      config: {
        rateLimit: { max: 60, timeWindow: '1 minute' },
      },
    },
    articlesController.getBySlug.bind(articlesController),
  );

  // ── Admin CRUD ──────────────────────────────────────

  fastify.post(
    '/articles',
    {
      preValidation: [authenticate, authorize('ADMIN')],
      config: {
        rateLimit: RATE_LIMITS.ADMIN_DEFAULT,
      },
    },
    articlesController.create.bind(articlesController),
  );

  fastify.patch(
    '/articles/:id',
    {
      preValidation: [authenticate, authorize('ADMIN')],
      config: {
        rateLimit: RATE_LIMITS.ADMIN_DEFAULT,
      },
    },
    articlesController.update.bind(articlesController),
  );

  fastify.delete(
    '/articles/:id',
    {
      preValidation: [authenticate, authorize('ADMIN')],
      config: {
        rateLimit: RATE_LIMITS.ADMIN_DEFAULT,
      },
    },
    articlesController.remove.bind(articlesController),
  );

  fastify.post(
    '/articles/:id/cover',
    {
      preValidation: [authenticate, authorize('ADMIN')],
      config: {
        rateLimit: RATE_LIMITS.ADMIN_DEFAULT,
      },
    },
    articlesController.uploadCover.bind(articlesController),
  );

  fastify.post(
    '/articles/:id/content-image',
    {
      preValidation: [authenticate, authorize('ADMIN')],
      config: {
        rateLimit: RATE_LIMITS.ADMIN_DEFAULT,
      },
    },
    articlesController.uploadContentImage.bind(articlesController),
  );

  fastify.patch(
    '/articles/:id/toggle-publish',
    {
      preValidation: [authenticate, authorize('ADMIN')],
      config: {
        rateLimit: RATE_LIMITS.ADMIN_DEFAULT,
      },
    },
    articlesController.togglePublished.bind(articlesController),
  );
}
