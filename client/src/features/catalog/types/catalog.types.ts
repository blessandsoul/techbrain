export interface CatalogLabel {
  ka: string;
  ru: string;
  en: string;
}

export interface CategoryNode {
  id: string;
  parentCategory: string | null;
  label: CatalogLabel;
  specFilter?: {
    kaKey: string;
    value: string;
  };
  children?: CategoryNode[];
}

export interface FilterFieldConfig {
  id: string;
  specKaKey: string;
  label: CatalogLabel;
  priority: number;
  defaultExpanded?: boolean;
}

export interface SpecValueOption {
  value: string;
  count: number;
}

// ── Product Types (matching server ProductResponse) ──

export type LocalizedString = CatalogLabel;

export interface IProductSpec {
  key: LocalizedString;
  value: string;
}

export interface IProduct {
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
  specs: IProductSpec[];
  relatedProducts?: string[];
  createdAt: string;
}

export interface CatalogConfigResponse {
  categories: CategoryNode[];
  filters: Record<string, FilterFieldConfig[]>;
}
