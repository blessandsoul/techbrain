/**
 * Tags Module — Zod Schemas
 */

import { z } from 'zod';

// ── Param Schemas ───────────────────────────────────────

export const TagIdParamSchema = z.object({
  id: z.string().uuid(),
});
export type TagIdParam = z.infer<typeof TagIdParamSchema>;

// ── Query Schemas ───────────────────────────────────────

export const TagsQuerySchema = z.object({
  search: z.string().optional(),
});
export type TagsQuery = z.infer<typeof TagsQuerySchema>;

// ── Create / Update Schemas ─────────────────────────────

const LocalizedNameSchema = z.object({
  ka: z.string().min(1).max(200),
  ru: z.string().max(200).default(''),
  en: z.string().max(200).default(''),
});

const LocalizedNamePartialSchema = z.object({
  ka: z.string().min(1).max(200).optional(),
  ru: z.string().max(200).optional(),
  en: z.string().max(200).optional(),
});

export const CreateTagSchema = z.object({
  name: LocalizedNameSchema,
});
export type CreateTagSchemaInput = z.infer<typeof CreateTagSchema>;

export const UpdateTagSchema = z.object({
  name: LocalizedNamePartialSchema.optional(),
});
export type UpdateTagSchemaInput = z.infer<typeof UpdateTagSchema>;
