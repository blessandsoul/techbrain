import { apiClient } from '@/lib/api/axios.config';
import { API_ENDPOINTS } from '@/lib/constants/api-endpoints';

import type { ApiResponse, PaginatedApiResponse } from '@/lib/api/api.types';
import type { IProduct, CatalogConfigResponse } from '@/features/catalog/types/catalog.types';
import type { AdminProductFilters, ICategory, SpecSuggestion, CreateProductInput, UpdateProductInput, DashboardStats } from '../types/admin.types';

class AdminProductService {
  async getSpecSuggestions(): Promise<SpecSuggestion[]> {
    const response = await apiClient.get<ApiResponse<SpecSuggestion[]>>(
      API_ENDPOINTS.PRODUCTS.SPEC_SUGGESTIONS,
    );
    return response.data.data;
  }

  async getCategories(): Promise<ICategory[]> {
    const response = await apiClient.get<ApiResponse<ICategory[]>>(
      API_ENDPOINTS.PRODUCTS.ADMIN_CATEGORIES,
    );
    return response.data.data;
  }

  async uploadImage(file: File): Promise<{ filename: string; url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<ApiResponse<{ filename: string; url: string }>>(
      API_ENDPOINTS.PRODUCTS.UPLOAD_IMAGE,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return response.data.data;
  }

  async deleteImage(url: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.PRODUCTS.DELETE_IMAGE, {
      data: { url },
    });
  }

  async createProduct(data: CreateProductInput): Promise<IProduct> {
    const response = await apiClient.post<ApiResponse<IProduct>>(
      API_ENDPOINTS.PRODUCTS.CREATE,
      data,
    );
    return response.data.data;
  }

  async updateProduct(id: string, data: UpdateProductInput): Promise<IProduct> {
    const response = await apiClient.patch<ApiResponse<IProduct>>(
      API_ENDPOINTS.PRODUCTS.UPDATE(id),
      data,
    );
    return response.data.data;
  }

  async getProducts(params?: AdminProductFilters): Promise<PaginatedApiResponse<IProduct>['data']> {
    const query: Record<string, string> = {};
    if (params?.search) query.search = params.search;
    if (params?.category) query.category = params.category;
    if (params?.isActive) query.isActive = params.isActive;
    if (params?.page) query.page = String(params.page);
    if (params?.limit) query.limit = String(params.limit);

    const response = await apiClient.get<PaginatedApiResponse<IProduct>>(
      API_ENDPOINTS.PRODUCTS.ADMIN_LIST,
      { params: query },
    );
    return response.data.data;
  }

  async toggleActive(id: string): Promise<IProduct> {
    const response = await apiClient.patch<ApiResponse<IProduct>>(
      API_ENDPOINTS.PRODUCTS.TOGGLE(id),
      {},
    );
    return response.data.data;
  }

  async deleteProduct(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.PRODUCTS.DELETE(id));
  }

  async batchToggle(ids: string[], isActive: boolean): Promise<{ count: number }> {
    const response = await apiClient.post<ApiResponse<{ count: number }>>(
      API_ENDPOINTS.PRODUCTS.BATCH_TOGGLE,
      { ids, isActive },
    );
    return response.data.data;
  }

  async batchDelete(ids: string[]): Promise<{ count: number }> {
    const response = await apiClient.post<ApiResponse<{ count: number }>>(
      API_ENDPOINTS.PRODUCTS.BATCH_DELETE,
      { ids },
    );
    return response.data.data;
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const response = await apiClient.get<ApiResponse<DashboardStats>>(
      API_ENDPOINTS.ADMIN.DASHBOARD_STATS,
    );
    return response.data.data;
  }

  async getCatalogConfig(): Promise<CatalogConfigResponse> {
    const response = await apiClient.get<ApiResponse<CatalogConfigResponse>>(
      API_ENDPOINTS.CATALOG.CONFIG,
    );
    return response.data.data;
  }

  async updateCatalogConfig(data: CatalogConfigResponse): Promise<CatalogConfigResponse> {
    const response = await apiClient.put<ApiResponse<CatalogConfigResponse>>(
      API_ENDPOINTS.CATALOG.CONFIG,
      data,
    );
    return response.data.data;
  }
}

export const adminProductService = new AdminProductService();
