'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { getErrorMessage } from '@/lib/utils/error';
import { tagService } from '../services/tag.service';

import type { CreateTagRequest, UpdateTagRequest } from '../types/tag.types';

// ── Query Key Factory ────────────────────────────────

export const tagKeys = {
  all: ['tags'] as const,
  lists: () => [...tagKeys.all, 'list'] as const,
  list: (search?: string) => [...tagKeys.lists(), search] as const,
};

// ── Queries ──────────────────────────────────────────

export function useTags(search?: string) {
  return useQuery({
    queryKey: tagKeys.list(search),
    queryFn: () => tagService.getTags(search),
  });
}

// ── Mutations ────────────────────────────────────────

export function useCreateTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTagRequest) => tagService.createTag(data),
    onSuccess: () => {
      toast.success('თეგი შეიქმნა');
      queryClient.invalidateQueries({ queryKey: tagKeys.all });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTagRequest }) =>
      tagService.updateTag(id, data),
    onSuccess: () => {
      toast.success('თეგი განახლდა');
      queryClient.invalidateQueries({ queryKey: tagKeys.all });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tagService.deleteTag(id),
    onSuccess: () => {
      toast.success('თეგი წაიშალა');
      queryClient.invalidateQueries({ queryKey: tagKeys.all });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
