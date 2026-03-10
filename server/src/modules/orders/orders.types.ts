/**
 * Orders Module — Types
 *
 * Response and input interfaces for orders.
 */

import type { OrderStatus } from '@prisma/client';

export interface OrderItemResponse {
  id: string;
  productName: string;
  productImage: string | null;
  productSlug: string | null;
  quantity: number;
  unitPrice: number;
}

export interface OrderNoteResponse {
  id: string;
  content: string;
  createdAt: string;
}

export interface OrderResponse {
  id: string;
  customerName: string;
  customerPhone: string;
  locale: string;
  total: number;
  status: string;
  items: OrderItemResponse[];
  notes: OrderNoteResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderFilters {
  status?: OrderStatus;
  search?: string;
}
