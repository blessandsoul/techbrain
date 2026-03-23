/**
 * Products Module — Types
 */

export type ProductCategorySlug = 'cameras' | 'nvr-kits' | 'storage' | 'services' | 'accessories';

export type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'name-asc';

export interface LocalizedString {
  ka: string;
  ru: string;
  en: string;
}

export interface ProductSpecResponse {
  key: LocalizedString;
  value: string;
}

export interface ProductResponse {
  id: string;
  slug: string;
  categories: string[];
  price: number;
  originalPrice?: number;
  discount: number | null;
  currency: string;
  isActive: boolean;
  isFeatured: boolean;
  inStock: boolean;
  images: string[];
  videoUrl: string | null;
  name: LocalizedString;
  description: LocalizedString;
  specs: ProductSpecResponse[];
  relatedProducts?: string[];
  createdAt: string;
}

export interface CatalogFiltersInput {
  category?: string;
  subcategorySpecFilter?: { kaKey: string; value: string };
  specs?: Record<string, string[]>;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  hasDiscount?: boolean;
  inStock?: boolean;
  sort?: SortOption;
  page: number;
  limit: number;
  locale?: string;
}

export interface FilteredProductsResult {
  items: ProductResponse[];
  totalItems: number;
  priceRange: { min: number; max: number };
}

export interface SpecValueOption {
  value: string;
  count: number;
}

export interface CatalogCategoryConfig {
  id: string;
  parentCategory: string | null;
  label: LocalizedString;
  specFilter?: { kaKey: string; value: string };
  children?: CatalogCategoryConfig[];
}

export interface CatalogFilterConfig {
  id: string;
  specKaKey: string;
  label: LocalizedString;
  priority: number;
  defaultExpanded?: boolean;
}

export interface CatalogConfigResponse {
  categories: CatalogCategoryConfig[];
  filters: Record<string, CatalogFilterConfig[]>;
}

export interface CreateProductInput {
  slug?: string;
  categoryIds: string[];
  price: number;
  originalPrice?: number;
  currency?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  inStock?: boolean;
  images?: string[];
  videoUrl?: string | null;
  name: LocalizedString;
  description?: { ka?: string; ru?: string; en?: string };
  content?: string;
  relatedProducts?: string[];
  specs?: Array<{ key: LocalizedString; value: string }>;
}

export interface SpecSuggestion {
  key: LocalizedString;
  values: string[];
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
  name?: { ka?: string; ru?: string; en?: string };
  description?: { ka?: string; ru?: string; en?: string };
  content?: string | null;
  relatedProducts?: string[] | null;
  specs?: Array<{ key: LocalizedString; value: string }>;
}
