'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { getErrorMessage } from '@/lib/utils/error';
import { ROUTES } from '@/lib/constants/routes';
import { articleService } from '../services/article.service';

import type { CreateArticleInput, UpdateArticleInput } from '@/features/articles/types/article.types';

// ── Query Key Factory ────────────────────────────────

export const articleKeys = {
  all: ['admin-articles'] as const,
  lists: () => [...articleKeys.all, 'list'] as const,
  details: () => [...articleKeys.all, 'detail'] as const,
  detail: (id: string) => [...articleKeys.details(), id] as const,
};

// ── Queries ──────────────────────────────────────────

export function useAdminArticles() {
  return useQuery({
    queryKey: articleKeys.lists(),
    queryFn: () => articleService.getAdminArticles(),
  });
}

export function useAdminArticle(id: string) {
  return useQuery({
    queryKey: articleKeys.detail(id),
    queryFn: () => articleService.getAdminArticle(id),
    enabled: !!id,
  });
}

// ── Mutations ────────────────────────────────────────

export function useCreateArticle() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: (data: CreateArticleInput) => articleService.createArticle(data),
    onSuccess: (created) => {
      toast.success('სტატია შეიქმნა');
      queryClient.invalidateQueries({ queryKey: articleKeys.all });
      router.push(ROUTES.ADMIN.ARTICLES_EDIT(created.id));
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateArticle() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateArticleInput }) =>
      articleService.updateArticle(id, data),
    onSuccess: () => {
      toast.success('სტატია განახლდა');
      queryClient.invalidateQueries({ queryKey: articleKeys.all });
      router.push(ROUTES.ADMIN.ARTICLES);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => articleService.deleteArticle(id),
    onSuccess: () => {
      toast.success('სტატია წაიშალა');
      queryClient.invalidateQueries({ queryKey: articleKeys.all });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useToggleArticlePublish() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => articleService.togglePublish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: articleKeys.all });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUploadArticleCover() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      articleService.uploadCover(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: articleKeys.all });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUploadArticleContentImage() {
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      articleService.uploadContentImage(id, file),
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
