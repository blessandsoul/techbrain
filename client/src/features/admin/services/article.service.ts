import { apiClient } from '@/lib/api/axios.config';
import { API_ENDPOINTS } from '@/lib/constants/api-endpoints';

import type { ApiResponse, PaginatedApiResponse } from '@/lib/api/api.types';
import type { IArticle, CreateArticleInput, UpdateArticleInput } from '@/features/articles/types/article.types';

class ArticleService {
  async getAdminArticles(): Promise<PaginatedApiResponse<IArticle>['data']> {
    const response = await apiClient.get<PaginatedApiResponse<IArticle>>(
      API_ENDPOINTS.ARTICLES.ADMIN_LIST,
      { params: { limit: 100 } },
    );
    return response.data.data;
  }

  async getAdminArticle(id: string): Promise<IArticle> {
    const response = await apiClient.get<ApiResponse<IArticle>>(
      API_ENDPOINTS.ARTICLES.ADMIN_BY_ID(id),
    );
    return response.data.data;
  }

  async createArticle(data: CreateArticleInput): Promise<IArticle> {
    const response = await apiClient.post<ApiResponse<IArticle>>(
      API_ENDPOINTS.ARTICLES.CREATE,
      data,
    );
    return response.data.data;
  }

  async updateArticle(id: string, data: UpdateArticleInput): Promise<IArticle> {
    const response = await apiClient.patch<ApiResponse<IArticle>>(
      API_ENDPOINTS.ARTICLES.UPDATE(id),
      data,
    );
    return response.data.data;
  }

  async deleteArticle(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.ARTICLES.DELETE(id));
  }

  async togglePublish(id: string): Promise<IArticle> {
    const response = await apiClient.patch<ApiResponse<IArticle>>(
      API_ENDPOINTS.ARTICLES.TOGGLE_PUBLISH(id),
      {},
    );
    return response.data.data;
  }

  async uploadCover(id: string, file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<ApiResponse<{ url: string }>>(
      API_ENDPOINTS.ARTICLES.UPLOAD_COVER(id),
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return response.data.data;
  }

  async uploadVideo(
    id: string,
    file: File,
    onUploadProgress?: (percent: number) => void,
  ): Promise<IArticle> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<ApiResponse<IArticle>>(
      API_ENDPOINTS.ARTICLES.UPLOAD_VIDEO(id),
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 0, // No timeout for video uploads
        onUploadProgress: (e) => {
          if (onUploadProgress && e.total) {
            onUploadProgress(Math.round((e.loaded / e.total) * 100));
          }
        },
      },
    );
    return response.data.data;
  }

  async uploadContentImage(id: string, file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<ApiResponse<{ url: string }>>(
      API_ENDPOINTS.ARTICLES.UPLOAD_CONTENT_IMAGE(id),
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return response.data.data;
  }
}

export const articleService = new ArticleService();
