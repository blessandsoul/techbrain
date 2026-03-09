/**
 * Inquiries Module — Zod Schemas
 *
 * Validation schemas for inquiry endpoints.
 */

import { z } from 'zod';

// ── Param Schemas ───────────────────────────────────────

export const InquiryIdParamSchema = z.object({
  id: z.string().uuid(),
});
export type InquiryIdParam = z.infer<typeof InquiryIdParamSchema>;

// ── Query Schemas ───────────────────────────────────────

export const AdminInquiriesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  search: z.string().max(200).optional(),
});
export type AdminInquiriesQuery = z.infer<typeof AdminInquiriesQuerySchema>;

// ── Body Schemas ────────────────────────────────────────

export const CreateInquirySchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().min(6).max(20),
  message: z.string().min(10).max(1000),
  locale: z.enum(['ka', 'ru', 'en']).default('ka'),
});
export type CreateInquiryInput = z.infer<typeof CreateInquirySchema>;
