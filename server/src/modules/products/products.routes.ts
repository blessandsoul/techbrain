/**
 * Products Routes
 *
 * Defines HTTP routes for product and catalog operations.
 */

import type { FastifyInstance } from 'fastify';
import { productsController } from './products.controller.js';
import { authenticate, authorize } from '@libs/auth.js';
import { RATE_LIMITS } from '@config/rate-limit.config.js';

/**
 * Products routes plugin
 *
 * Public endpoints:
 * - GET  /products/catalog              - Filtered product listing
 * - GET  /products/catalog/config       - Catalog config (categories + filters)
 * - GET  /products/catalog/spec-values  - Available filter values with counts
 * - GET  /products/catalog/price-range  - Min/max price for category
 * - GET  /products/catalog/category-counts - Product counts per category
 * - GET  /products/featured             - Featured products
 * - GET  /products/:slugOrId            - Single product by slug or ID
 * - GET  /products/:slugOrId/related    - Related products
 *
 * Admin endpoints:
 * - GET    /products/admin              - All products (paginated, admin)
 * - GET    /products/admin/spec-suggestions - Aggregated spec keys + values from existing products
 * - GET    /products/admin/categories   - List all categories
 * - POST   /products/admin/upload-image - Upload a product image
 * - DELETE /products/admin/delete-image - Delete a product image
 * - PATCH  /products/:id/toggle         - Toggle product isActive
 * - POST   /products/admin/batch-toggle - Batch toggle isActive
 * - POST   /products/admin/batch-delete - Batch delete products
 * - POST   /products                    - Create product
 * - PATCH  /products/:id                - Update product
 * - DELETE /products/:id                - Delete product
 * - PUT    /products/catalog/config     - Update catalog config
 */
export async function productsRoutes(fastify: FastifyInstance): Promise<void> {
  // ── Public Catalog Endpoints ────────────────────────

  fastify.get(
    '/products/catalog',
    {
      config: {
        rateLimit: { max: 60, timeWindow: '1 minute' },
      },
    },
    productsController.getCatalog.bind(productsController),
  );

  fastify.get(
    '/products/catalog/config',
    {
      config: {
        rateLimit: { max: 60, timeWindow: '1 minute' },
      },
    },
    productsController.getCatalogConfig.bind(productsController),
  );

  fastify.get(
    '/products/catalog/spec-values',
    {
      config: {
        rateLimit: { max: 60, timeWindow: '1 minute' },
      },
    },
    productsController.getSpecValues.bind(productsController),
  );

  fastify.get(
    '/products/catalog/price-range',
    {
      config: {
        rateLimit: { max: 60, timeWindow: '1 minute' },
      },
    },
    productsController.getPriceRange.bind(productsController),
  );

  fastify.get(
    '/products/catalog/category-counts',
    {
      config: {
        rateLimit: { max: 60, timeWindow: '1 minute' },
      },
    },
    productsController.getCategoryCounts.bind(productsController),
  );

  fastify.get(
    '/products/featured',
    {
      config: {
        rateLimit: { max: 60, timeWindow: '1 minute' },
      },
    },
    productsController.getFeatured.bind(productsController),
  );

  // ── Admin Endpoints ─────────────────────────────────
  // NOTE: /products/admin* must come BEFORE /products/:slugOrId
  // to avoid the :slugOrId param matching "admin"

  fastify.get(
    '/products/admin',
    {
      preValidation: [authenticate, authorize('ADMIN')],
      config: {
        rateLimit: RATE_LIMITS.ADMIN_DEFAULT,
      },
    },
    productsController.getAll.bind(productsController),
  );

  fastify.get(
    '/products/admin/spec-suggestions',
    {
      preValidation: [authenticate, authorize('ADMIN')],
      config: {
        rateLimit: RATE_LIMITS.ADMIN_DEFAULT,
      },
    },
    productsController.getSpecSuggestions.bind(productsController),
  );

  fastify.get(
    '/products/admin/categories',
    {
      preValidation: [authenticate, authorize('ADMIN')],
      config: {
        rateLimit: RATE_LIMITS.ADMIN_DEFAULT,
      },
    },
    productsController.getCategories.bind(productsController),
  );

  fastify.post(
    '/products/admin/upload-image',
    {
      preValidation: [authenticate, authorize('ADMIN')],
      config: {
        rateLimit: RATE_LIMITS.ADMIN_DEFAULT,
      },
    },
    productsController.uploadProductImage.bind(productsController),
  );

  fastify.delete(
    '/products/admin/delete-image',
    {
      preValidation: [authenticate, authorize('ADMIN')],
      config: {
        rateLimit: RATE_LIMITS.ADMIN_DEFAULT,
      },
    },
    productsController.deleteProductImage.bind(productsController),
  );

  fastify.post(
    '/products/admin/batch-toggle',
    {
      preValidation: [authenticate, authorize('ADMIN')],
      config: {
        rateLimit: RATE_LIMITS.ADMIN_DEFAULT,
      },
    },
    productsController.batchToggle.bind(productsController),
  );

  fastify.post(
    '/products/admin/batch-delete',
    {
      preValidation: [authenticate, authorize('ADMIN')],
      config: {
        rateLimit: RATE_LIMITS.ADMIN_DEFAULT,
      },
    },
    productsController.batchDelete.bind(productsController),
  );

  // NOTE: Dynamic :slugOrId routes must come AFTER all static routes
  // to avoid matching "catalog", "featured", "admin", etc.

  fastify.get(
    '/products/:slugOrId/related',
    {
      config: {
        rateLimit: { max: 60, timeWindow: '1 minute' },
      },
    },
    productsController.getRelated.bind(productsController),
  );

  fastify.get(
    '/products/:slugOrId',
    {
      config: {
        rateLimit: { max: 60, timeWindow: '1 minute' },
      },
    },
    productsController.getBySlugOrId.bind(productsController),
  );

  // ── Admin CRUD Endpoints ──────────────────────────────

  fastify.patch(
    '/products/:id/toggle',
    {
      preValidation: [authenticate, authorize('ADMIN')],
      config: {
        rateLimit: RATE_LIMITS.ADMIN_DEFAULT,
      },
    },
    productsController.toggleActive.bind(productsController),
  );

  fastify.post(
    '/products',
    {
      preValidation: [authenticate, authorize('ADMIN')],
      config: {
        rateLimit: RATE_LIMITS.ADMIN_DEFAULT,
      },
    },
    productsController.createProduct.bind(productsController),
  );

  fastify.patch(
    '/products/:id',
    {
      preValidation: [authenticate, authorize('ADMIN')],
      config: {
        rateLimit: RATE_LIMITS.ADMIN_DEFAULT,
      },
    },
    productsController.updateProduct.bind(productsController),
  );

  fastify.delete(
    '/products/:id',
    {
      preValidation: [authenticate, authorize('ADMIN')],
      config: {
        rateLimit: RATE_LIMITS.ADMIN_DEFAULT,
      },
    },
    productsController.deleteProduct.bind(productsController),
  );

  fastify.put(
    '/products/catalog/config',
    {
      preValidation: [authenticate, authorize('ADMIN')],
      config: {
        rateLimit: RATE_LIMITS.ADMIN_DEFAULT,
      },
    },
    productsController.updateCatalogConfig.bind(productsController),
  );
}
