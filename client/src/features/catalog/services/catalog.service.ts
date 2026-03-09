import { apiClient } from '@/lib/api/axios.config';
import { API_ENDPOINTS } from '@/lib/constants/api-endpoints';

import type { ApiResponse, PaginatedApiResponse } from '@/lib/api/api.types';
import type {
  IProduct,
  CatalogConfigResponse,
  SpecValueOption,
} from '../types/catalog.types';

interface CatalogProductsParams {
  category?: string;
  subcategorySpecFilter?: { kaKey: string; value: string };
  specs?: Record<string, string[]>;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  hasDiscount?: boolean;
  sort?: string;
  page: number;
  limit: number;
  locale?: string;
}

interface CatalogProductsResult {
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

class CatalogService {
  async getProducts(params: CatalogProductsParams): Promise<CatalogProductsResult> {
    const query: Record<string, string | number> = {
      page: params.page,
      limit: params.limit,
    };

    if (params.category) query.category = params.category;
    if (params.search) query.search = params.search;
    if (params.sort) query.sort = params.sort;
    if (params.minPrice !== undefined) query.minPrice = params.minPrice;
    if (params.maxPrice !== undefined) query.maxPrice = params.maxPrice;
    if (params.locale) query.locale = params.locale;
    if (params.hasDiscount) query.hasDiscount = 'true';

    if (params.subcategorySpecFilter) {
      query.subcategorySpecFilter = JSON.stringify(params.subcategorySpecFilter);
    }
    if (params.specs && Object.keys(params.specs).length > 0) {
      query.specs = JSON.stringify(params.specs);
    }

    const response = await apiClient.get<PaginatedApiResponse<IProduct>>(
      API_ENDPOINTS.CATALOG.PRODUCTS,
      { params: query },
    );
    return response.data.data;
  }

  async getConfig(): Promise<CatalogConfigResponse> {
    const response = await apiClient.get<ApiResponse<CatalogConfigResponse>>(
      API_ENDPOINTS.CATALOG.CONFIG,
    );
    return response.data.data;
  }

  async getSpecValues(
    category?: string,
    subcategorySpecFilter?: { kaKey: string; value: string },
  ): Promise<Record<string, SpecValueOption[]>> {
    const query: Record<string, string> = {};
    if (category) query.category = category;
    if (subcategorySpecFilter) {
      query.subcategorySpecFilter = JSON.stringify(subcategorySpecFilter);
    }

    const response = await apiClient.get<ApiResponse<Record<string, SpecValueOption[]>>>(
      API_ENDPOINTS.CATALOG.SPEC_VALUES,
      { params: query },
    );
    return response.data.data;
  }

  async getPriceRange(
    category?: string,
    subcategorySpecFilter?: { kaKey: string; value: string },
  ): Promise<{ min: number; max: number }> {
    const query: Record<string, string> = {};
    if (category) query.category = category;
    if (subcategorySpecFilter) {
      query.subcategorySpecFilter = JSON.stringify(subcategorySpecFilter);
    }

    const response = await apiClient.get<ApiResponse<{ min: number; max: number }>>(
      API_ENDPOINTS.CATALOG.PRICE_RANGE,
      { params: query },
    );
    return response.data.data;
  }

  async getCategoryCounts(): Promise<Record<string, number>> {
    const response = await apiClient.get<ApiResponse<Record<string, number>>>(
      API_ENDPOINTS.CATALOG.CATEGORY_COUNTS,
    );
    return response.data.data;
  }

  async getProduct(slugOrId: string): Promise<IProduct> {
    const response = await apiClient.get<ApiResponse<IProduct>>(
      API_ENDPOINTS.CATALOG.PRODUCT(slugOrId),
    );
    return response.data.data;
  }

  async getRelatedProducts(slugOrId: string): Promise<IProduct[]> {
    const response = await apiClient.get<ApiResponse<IProduct[]>>(
      API_ENDPOINTS.CATALOG.RELATED(slugOrId),
    );
    return response.data.data;
  }

  async getFeaturedProducts(): Promise<IProduct[]> {
    const response = await apiClient.get<ApiResponse<IProduct[]>>(
      API_ENDPOINTS.CATALOG.FEATURED,
    );
    return response.data.data;
  }
}

export const catalogService = new CatalogService();
