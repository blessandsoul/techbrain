'use client';

import { useQuery } from '@tanstack/react-query';
import { blogService } from '../services/blog.service';

import type { Article, ArticleFilters } from '../types/article.types';
import type { PaginationParams } from '@/lib/api/api.types';

// ── Query Key Factory ──

export const blogKeys = {
  all: ['blog'] as const,
  lists: () => [...blogKeys.all, 'list'] as const,
  list: (filters?: ArticleFilters & PaginationParams) =>
    [...blogKeys.lists(), filters] as const,
  details: () => [...blogKeys.all, 'detail'] as const,
  detail: (slug: string) => [...blogKeys.details(), slug] as const,
};

// ── Hooks ──

export function useArticles(
  filters?: ArticleFilters & PaginationParams,
): ReturnType<typeof useQuery<{
  items: Article[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}>> {
  return useQuery({
    queryKey: blogKeys.list(filters),
    queryFn: () => blogService.getArticles(filters),
  });
}

export function useArticle(slug: string): ReturnType<typeof useQuery<Article>> {
  return useQuery({
    queryKey: blogKeys.detail(slug),
    queryFn: () => blogService.getArticleBySlug(slug),
    enabled: !!slug,
  });
}

// ── Helpers ──

export function getArticleImageUrl(relativePath: string): string {
  if (relativePath.startsWith('http')) return relativePath;
  const base =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api/v1', '') ??
    'http://localhost:8000';
  return `${base}${relativePath}`;
}
