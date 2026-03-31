import { apiClient } from '@/lib/api/axios.config';
import { API_ENDPOINTS } from '@/lib/constants/api-endpoints';

import type { ApiResponse, PaginatedApiResponse, PaginationParams } from '@/lib/api/api.types';
import type { Article, ArticleFilters } from '../types/article.types';

interface ArticlesResult {
  items: Article[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

class BlogService {
  async getArticles(params?: ArticleFilters & PaginationParams): Promise<ArticlesResult> {
    const query: Record<string, string | number> = {
      page: params?.page ?? 1,
      limit: params?.limit ?? 12,
    };

    if (params?.category) query.category = params.category;
    if (params?.tag) query.tag = params.tag;

    const response = await apiClient.get<PaginatedApiResponse<Article>>(
      API_ENDPOINTS.ARTICLES.LIST,
      { params: query },
    );
    return response.data.data;
  }

  async getArticleBySlug(slug: string): Promise<Article> {
    const response = await apiClient.get<ApiResponse<Article>>(
      API_ENDPOINTS.ARTICLES.BY_SLUG(slug),
    );
    return response.data.data;
  }
}

export const blogService = new BlogService();
