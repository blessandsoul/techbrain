/**
 * Projects Routes
 *
 * Defines HTTP routes for project operations.
 *
 * Public endpoints:
 * - GET  /projects          - Active projects sorted by sortOrder (supports ?type= filter)
 * - GET  /projects/:slug    - Single project by slug
 *
 * Admin endpoints:
 * - GET    /projects/admin            - Paginated list (all projects)
 * - GET    /projects/admin/:id        - Single project by ID (admin)
 * - POST   /projects                  - Create project
 * - PATCH  /projects/:id              - Update project
 * - DELETE /projects/:id              - Delete project
 * - POST   /projects/:id/image        - Upload project cover image
 * - POST   /projects/:id/content-image - Upload project content image
 */

import type { FastifyInstance } from 'fastify';
import { projectsController } from './projects.controller.js';
import { authenticate, authorize } from '@libs/auth.js';
import { RATE_LIMITS } from '@config/rate-limit.config.js';

export async function projectsRoutes(fastify: FastifyInstance): Promise<void> {
  // ── Public Endpoints ──────────────────────────────

  fastify.get(
    '/projects',
    {
      config: {
        rateLimit: { max: 60, timeWindow: '1 minute' },
      },
    },
    projectsController.getActiveProjects.bind(projectsController),
  );

  // NOTE: /projects/admin must come BEFORE /projects/:slug
  // to avoid the :slug param matching "admin"

  // ── Admin Endpoints ───────────────────────────────

  fastify.get(
    '/projects/admin',
    {
      preValidation: [authenticate, authorize('ADMIN')],
      config: {
        rateLimit: RATE_LIMITS.ADMIN_DEFAULT,
      },
    },
    projectsController.getAllProjects.bind(projectsController),
  );

  fastify.get(
    '/projects/admin/:id',
    {
      preValidation: [authenticate, authorize('ADMIN')],
      config: {
        rateLimit: RATE_LIMITS.ADMIN_DEFAULT,
      },
    },
    projectsController.getProject.bind(projectsController),
  );

  // ── Public Single Project (by slug) ─────────────────

  fastify.get(
    '/projects/:slug',
    {
      config: {
        rateLimit: { max: 60, timeWindow: '1 minute' },
      },
    },
    projectsController.getProjectBySlug.bind(projectsController),
  );

  // ── Admin CRUD ────────────────────────────────────

  fastify.post(
    '/projects',
    {
      preValidation: [authenticate, authorize('ADMIN')],
      config: {
        rateLimit: RATE_LIMITS.ADMIN_DEFAULT,
      },
    },
    projectsController.createProject.bind(projectsController),
  );

  fastify.patch(
    '/projects/:id',
    {
      preValidation: [authenticate, authorize('ADMIN')],
      config: {
        rateLimit: RATE_LIMITS.ADMIN_DEFAULT,
      },
    },
    projectsController.updateProject.bind(projectsController),
  );

  fastify.delete(
    '/projects/:id',
    {
      preValidation: [authenticate, authorize('ADMIN')],
      config: {
        rateLimit: RATE_LIMITS.ADMIN_DEFAULT,
      },
    },
    projectsController.deleteProject.bind(projectsController),
  );

  fastify.post(
    '/projects/:id/image',
    {
      preValidation: [authenticate, authorize('ADMIN')],
      config: {
        rateLimit: RATE_LIMITS.ADMIN_DEFAULT,
      },
    },
    projectsController.uploadImage.bind(projectsController),
  );

  fastify.post(
    '/projects/:id/video',
    {
      preValidation: [authenticate, authorize('ADMIN')],
      config: {
        rateLimit: RATE_LIMITS.ADMIN_DEFAULT,
      },
    },
    projectsController.uploadVideo.bind(projectsController),
  );

  fastify.post(
    '/projects/:id/content-image',
    {
      preValidation: [authenticate, authorize('ADMIN')],
      config: {
        rateLimit: RATE_LIMITS.ADMIN_DEFAULT,
      },
    },
    projectsController.uploadContentImage.bind(projectsController),
  );
}
