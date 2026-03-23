import type { IProduct, LocalizedString } from '@/features/catalog/types/catalog.types';

export type { IProduct };

export interface AdminProductFilters {
  search?: string;
  category?: string;
  isActive?: string; // 'true' | 'false' | undefined (all)
  page?: number;
  limit?: number;
}

export interface AdminProductsResponse {
  items: IProduct[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface ICategory {
  id: string;
  slug: string;
  name: LocalizedString;
}

export interface SpecSuggestion {
  key: LocalizedString;
  values: string[];
}

export interface DashboardStats {
  products: { total: number; active: number };
  articles: { total: number; published: number };
  orders: { total: number };
  revenue: number;
}

export interface CreateProductInput {
  slug: string;
  categoryIds: string[];
  price: number;
  originalPrice?: number;
  currency?: string;
  isActive: boolean;
  isFeatured: boolean;
  inStock: boolean;
  images: string[];
  videoUrl?: string | null;
  name: LocalizedString;
  description?: Partial<LocalizedString>;
  specs: Array<{ key: LocalizedString; value: string }>;
  relatedProducts?: string[];
}

export interface UpdateProductInput {
  slug?: string;
  categoryIds?: string[];
  price?: number;
  originalPrice?: number | null;
  currency?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  inStock?: boolean;
  images?: string[];
  videoUrl?: string | null;
  name?: Partial<LocalizedString>;
  description?: Partial<LocalizedString>;
  specs?: Array<{ key: LocalizedString; value: string }>;
  relatedProducts?: string[] | null;
}
