import type { OrderStatus } from '../types/orders.types';

export const statusColors: Record<OrderStatus, string> = {
  NEW: 'bg-info/10 text-info',
  CONTACTED: 'bg-warning/10 text-warning',
  COMPLETED: 'bg-success/10 text-success',
};

export const statusLabels: Record<OrderStatus, string> = {
  NEW: 'ახალი',
  CONTACTED: 'დაკავშირებული',
  COMPLETED: 'დასრულებული',
};

export const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = {
  NEW: 'CONTACTED',
  CONTACTED: 'COMPLETED',
};

export const localeLabels: Record<string, string> = {
  ka: 'ქართული',
  ru: 'რუსული',
  en: 'ინგლისური',
};
