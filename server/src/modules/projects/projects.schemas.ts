/**
 * Projects Module — Zod Schemas
 */

import { z } from 'zod';

// ── Param Schemas ───────────────────────────────────────

export const ProjectIdParamSchema = z.object({
  id: z.string().uuid(),
});
export type ProjectIdParam = z.infer<typeof ProjectIdParamSchema>;

// ── Query Schemas ───────────────────────────────────────

export const PublicProjectsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
});
export type PublicProjectsQuery = z.infer<typeof PublicProjectsQuerySchema>;

export const AdminProjectsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  isActive: z.enum(['true', 'false']).transform((v) => v === 'true').optional(),
});
export type AdminProjectsQuery = z.infer<typeof AdminProjectsQuerySchema>;

// ── Localized String Schemas ────────────────────────────

const LocalizedStringSchema = z.object({
  ka: z.string().min(1),
  ru: z.string().default(''),
  en: z.string().default(''),
});

const LocalizedStringPartialSchema = z.object({
  ka: z.string().optional(),
  ru: z.string().optional(),
  en: z.string().optional(),
});

// ── Create / Update Schemas ─────────────────────────────

export const CreateProjectSchema = z.object({
  title: LocalizedStringSchema,
  location: LocalizedStringSchema,
  type: z.enum(['commercial', 'residential', 'retail', 'office']),
  cameras: z.number().int().min(0),
  image: z.string().max(500).optional(),
  year: z.string().min(4).max(10),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});
export type CreateProjectSchemaInput = z.infer<typeof CreateProjectSchema>;

export const UpdateProjectSchema = z.object({
  title: LocalizedStringPartialSchema.optional(),
  location: LocalizedStringPartialSchema.optional(),
  type: z.enum(['commercial', 'residential', 'retail', 'office']).optional(),
  cameras: z.number().int().min(0).optional(),
  image: z.string().max(500).nullable().optional(),
  year: z.string().min(4).max(10).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});
export type UpdateProjectSchemaInput = z.infer<typeof UpdateProjectSchema>;
