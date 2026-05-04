'use client';

import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { catalogService } from '../services/catalog.service';

import type {
  CategoryNode,
  FilterFieldConfig,
  SpecValueOption,
  IProduct,
} from '../types/catalog.types';

// ── Query Key Factory ──

export const catalogKeys = {
  all: ['catalog'] as const,
  config: () => [...catalogKeys.all, 'config'] as const,
  categoryCounts: () => [...catalogKeys.all, 'category-counts'] as const,
  products: () => [...catalogKeys.all, 'products'] as const,
  productList: (filters: Record<string, unknown>) =>
    [...catalogKeys.products(), filters] as const,
  specValues: (category?: string, specFilter?: object) =>
    [...catalogKeys.all, 'spec-values', { category, specFilter }] as const,
  priceRange: (category?: string, specFilter?: object) =>
    [...catalogKeys.all, 'price-range', { category, specFilter }] as const,
  detail: (slugOrId: string) =>
    [...catalogKeys.all, 'detail', slugOrId] as const,
  related: (slugOrId: string) =>
    [...catalogKeys.all, 'related', slugOrId] as const,
  featured: () => [...catalogKeys.all, 'featured'] as const,
  discounted: () => [...catalogKeys.all, 'discounted'] as const,
};

// ── Individual Hooks ──

export function useCatalogConfig(): ReturnType<typeof useQuery<{
  categories: CategoryNode[];
  filters: Record<string, FilterFieldConfig[]>;
}>> {
  return useQuery({
    queryKey: catalogKeys.config(),
    queryFn: () => catalogService.getConfig(),
    staleTime: Infinity,
  });
}

export function useCategoryCounts(): ReturnType<typeof useQuery<Record<string, number>>> {
  return useQuery({
    queryKey: catalogKeys.categoryCounts(),
    queryFn: () => catalogService.getCategoryCounts(),
  });
}

export function useProduct(slug: string): ReturnType<typeof useQuery<IProduct>> {
  return useQuery({
    queryKey: catalogKeys.detail(slug),
    queryFn: () => catalogService.getProduct(slug),
    enabled: !!slug,
  });
}

export function useRelatedProducts(slug: string, enabled = true): ReturnType<typeof useQuery<IProduct[]>> {
  return useQuery({
    queryKey: catalogKeys.related(slug),
    queryFn: () => catalogService.getRelatedProducts(slug),
    enabled: !!slug && enabled,
  });
}

export function useFeaturedProducts(): ReturnType<typeof useQuery<IProduct[]>> {
  return useQuery({
    queryKey: catalogKeys.featured(),
    queryFn: () => catalogService.getFeaturedProducts(),
  });
}

export function useAllProducts(limit = 12): ReturnType<typeof useQuery<IProduct[]>> {
  return useQuery({
    queryKey: [...catalogKeys.products(), 'all', limit, 'in-stock'] as const,
    queryFn: async () => {
      const result = await catalogService.getProducts({
        page: 1,
        limit,
        sort: 'newest',
        inStock: true,
      });
      return result.items;
    },
  });
}

export function useDiscountedProducts(): ReturnType<typeof useQuery<IProduct[]>> {
  return useQuery({
    queryKey: [...catalogKeys.discounted(), 'in-stock'] as const,
    queryFn: async () => {
      const result = await catalogService.getProducts({
        hasDiscount: true,
        page: 1,
        limit: 50,
        sort: 'newest',
        inStock: true,
      });
      return result.items;
    },
  });
}

// ── Helpers ──

function resolveSubcategorySpecFilter(
  subcategoryId: string | undefined,
  categories: CategoryNode[],
): { kaKey: string; value: string } | undefined {
  if (!subcategoryId) return undefined;
  for (const cat of categories) {
    if (cat.children) {
      const child = cat.children.find((c) => c.id === subcategoryId);
      if (child?.specFilter) return child.specFilter;
    }
  }
  return undefined;
}

function getProductImageUrl(relativePath: string): string {
  if (relativePath.startsWith('http')) return relativePath;
  const base =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api/v1', '') ??
    'http://localhost:8000';
  if (relativePath.startsWith('/uploads/')) {
    return `${base}${relativePath}`;
  }
  return `${base}/uploads/products/${relativePath}`;
}

export { getProductImageUrl };

// ── Composite Hook ──

interface CatalogPageData {
  categoryTree: CategoryNode[];
  filterConfigs: FilterFieldConfig[];
  products: IProduct[];
  pagination: {
    page: number;
    totalPages: number;
    totalItems: number;
  };
  specValues: Record<string, SpecValueOption[]>;
  priceRange: { min: number; max: number };
  categoryCounts: Record<string, number>;
  isLoading: boolean;
  isProductsLoading: boolean;
}

export function useCatalogPageData(): CatalogPageData {
  const searchParams = useSearchParams();

  // Parse URL params
  const category = searchParams.get('category') ?? undefined;
  const subcategory = searchParams.get('subcategory') ?? undefined;
  const page = Number(searchParams.get('page') ?? '1');
  const limit = Number(searchParams.get('limit') ?? '12');
  const sort = searchParams.get('sort') ?? undefined;
  const search = searchParams.get('search') ?? undefined;
  const minPrice = searchParams.get('minPrice')
    ? Number(searchParams.get('minPrice'))
    : undefined;
  const maxPrice = searchParams.get('maxPrice')
    ? Number(searchParams.get('maxPrice'))
    : undefined;
  const inStock = searchParams.get('inStock') === 'true' ? true : undefined;

  // 1. Fetch config (categories + filters)
  const configQuery = useCatalogConfig();
  const categories = configQuery.data?.categories ?? [];
  const allFilters = configQuery.data?.filters ?? {};

  // 2. Resolve subcategory → specFilter
  const specFilter = resolveSubcategorySpecFilter(subcategory, categories);

  // 3. Get filter configs for current category
  const filterConfigs = category ? (allFilters[category] ?? []) : [];

  // 4. Build specs object from URL params
  const specs: Record<string, string[]> = {};
  for (const config of filterConfigs) {
    const val = searchParams.get(config.id);
    if (val) {
      specs[config.id] = val.split(',');
    }
  }

  // 5. Fetch products
  const productsQuery = useQuery({
    queryKey: catalogKeys.productList({
      category,
      subcategory,
      specs,
      search,
      minPrice,
      maxPrice,
      inStock,
      sort,
      page,
      limit,
    }),
    queryFn: () =>
      catalogService.getProducts({
        category,
        subcategorySpecFilter: specFilter,
        specs: Object.keys(specs).length > 0 ? specs : undefined,
        search,
        minPrice,
        maxPrice,
        inStock,
        sort,
        page,
        limit,
      }),
    enabled: configQuery.isSuccess,
  });

  // 6. Fetch spec values
  const specValuesQuery = useQuery({
    queryKey: catalogKeys.specValues(category, specFilter),
    queryFn: () => catalogService.getSpecValues(category, specFilter),
    enabled: configQuery.isSuccess,
  });

  // 7. Fetch price range
  const priceRangeQuery = useQuery({
    queryKey: catalogKeys.priceRange(category, specFilter),
    queryFn: () => catalogService.getPriceRange(category, specFilter),
    enabled: configQuery.isSuccess,
  });

  // 8. Fetch category counts
  const categoryCountsQuery = useCategoryCounts();

  return {
    categoryTree: categories,
    filterConfigs,
    products: productsQuery.data?.items ?? [],
    pagination: {
      page,
      totalPages: productsQuery.data?.pagination.totalPages ?? 1,
      totalItems: productsQuery.data?.pagination.totalItems ?? 0,
    },
    specValues: specValuesQuery.data ?? {},
    priceRange: priceRangeQuery.data ?? { min: 0, max: 0 },
    categoryCounts: categoryCountsQuery.data ?? {},
    isLoading: configQuery.isLoading,
    isProductsLoading: productsQuery.isLoading,
  };
}
