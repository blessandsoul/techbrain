/**
 * Orders Module — Zod Schemas
 *
 * Validation schemas for order endpoints.
 */

import { z } from 'zod';

// ── Param Schemas ───────────────────────────────────────

export const OrderIdParamSchema = z.object({
  id: z.string().uuid(),
});
export type OrderIdParam = z.infer<typeof OrderIdParamSchema>;

// ── Query Schemas ───────────────────────────────────────

export const AdminOrdersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: z.enum(['NEW', 'CONTACTED', 'COMPLETED']).optional(),
  search: z.string().max(200).optional(),
});
export type AdminOrdersQuery = z.infer<typeof AdminOrdersQuerySchema>;

// ── Body Schemas ────────────────────────────────────────

const OrderItemSchema = z.object({
  productId: z.string().max(191).optional(),
  productName: z.string().min(1).max(500),
  productImage: z.string().max(500).optional(),
  productSlug: z.string().max(300).optional(),
  quantity: z.number().int().min(1).max(10000, 'Quantity cannot exceed 10,000'),
  unitPrice: z.number().min(0).max(1000000, 'Unit price cannot exceed 1,000,000'),
});

export const CreateOrderSchema = z.object({
  customerName: z.string().min(2).max(100),
  customerPhone: z.string().min(1).max(30),
  locale: z.enum(['ka', 'ru', 'en']).default('ka'),
  items: z.array(OrderItemSchema).min(1),
  total: z.number().min(0).max(10000000).optional(),
});
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

export const UpdateOrderStatusSchema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'COMPLETED']),
});
export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>;

export const BulkUpdateOrderStatusSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(100),
  status: z.enum(['NEW', 'CONTACTED', 'COMPLETED']),
});
export type BulkUpdateOrderStatusInput = z.infer<typeof BulkUpdateOrderStatusSchema>;

export const CreateOrderNoteSchema = z.object({
  content: z.string().min(1, 'Note cannot be empty').max(2000, 'Note cannot exceed 2000 characters'),
});
export type CreateOrderNoteInput = z.infer<typeof CreateOrderNoteSchema>;
