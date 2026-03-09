/**
 * Articles Module — Zod Schemas
 */

import { z } from 'zod';

// ── Param Schemas ───────────────────────────────────────

export const ArticleIdParamSchema = z.object({
  id: z.string().uuid(),
});
export type ArticleIdParam = z.infer<typeof ArticleIdParamSchema>;

export const ArticleSlugParamSchema = z.object({
  slug: z.string().min(1).max(300),
});
export type ArticleSlugParam = z.infer<typeof ArticleSlugParamSchema>;

// ── Query Schemas ───────────────────────────────────────

export const PublicArticlesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  category: z.enum(['cameras', 'nvr', 'installation', 'news', 'guides']).optional(),
});
export type PublicArticlesQuery = z.infer<typeof PublicArticlesQuerySchema>;

export const AdminArticlesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  isPublished: z.enum(['true', 'false']).transform((v) => v === 'true').optional(),
  category: z.enum(['cameras', 'nvr', 'installation', 'news', 'guides']).optional(),
});
export type AdminArticlesQuery = z.infer<typeof AdminArticlesQuerySchema>;

// ── Create / Update Schemas ─────────────────────────────

const ARTICLE_CATEGORIES = ['cameras', 'nvr', 'installation', 'news', 'guides'] as const;

export const CreateArticleSchema = z.object({
  slug: z.string().min(1).max(300).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens only'),
  title: z.string().min(1).max(500),
  excerpt: z.string().min(1).max(2000),
  content: z.string().min(1),
  category: z.enum(ARTICLE_CATEGORIES),
  readMin: z.number().int().min(1).max(120).default(5),
  isPublished: z.boolean().default(false),
});
export type CreateArticleSchemaInput = z.infer<typeof CreateArticleSchema>;

export const UpdateArticleSchema = z.object({
  slug: z.string().min(1).max(300).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens only').optional(),
  title: z.string().min(1).max(500).optional(),
  excerpt: z.string().min(1).max(2000).optional(),
  content: z.string().min(1).optional(),
  category: z.enum(ARTICLE_CATEGORIES).optional(),
  readMin: z.number().int().min(1).max(120).optional(),
  isPublished: z.boolean().optional(),
});
export type UpdateArticleSchemaInput = z.infer<typeof UpdateArticleSchema>;
