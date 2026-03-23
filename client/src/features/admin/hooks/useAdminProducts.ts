'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { getErrorMessage } from '@/lib/utils/error';
import { adminProductService } from '../services/admin-product.service';

import type { AdminProductFilters, CreateProductInput, UpdateProductInput } from '../types/admin.types';

// ── Query Key Factory ────────────────────────────────

export const adminProductKeys = {
  all: ['admin-products'] as const,
  lists: () => [...adminProductKeys.all, 'list'] as const,
  list: (filters: AdminProductFilters) => [...adminProductKeys.lists(), filters] as const,
  categories: () => [...adminProductKeys.all, 'categories'] as const,
  specSuggestions: () => [...adminProductKeys.all, 'spec-suggestions'] as const,
  dashboardStats: () => ['admin-dashboard-stats'] as const,
};

// ── Queries ──────────────────────────────────────────

export function useAdminProducts(filters: AdminProductFilters) {
  return useQuery({
    queryKey: adminProductKeys.list(filters),
    queryFn: () => adminProductService.getProducts(filters),
  });
}

export function useAdminCategories() {
  return useQuery({
    queryKey: adminProductKeys.categories(),
    queryFn: () => adminProductService.getCategories(),
    staleTime: 10 * 60 * 1000, // 10 min — categories rarely change
  });
}

export function useSpecSuggestions() {
  return useQuery({
    queryKey: adminProductKeys.specSuggestions(),
    queryFn: () => adminProductService.getSpecSuggestions(),
    staleTime: 5 * 60 * 1000, // 5 min
  });
}

export function useAdminDashboardStats() {
  return useQuery({
    queryKey: adminProductKeys.dashboardStats(),
    queryFn: () => adminProductService.getDashboardStats(),
    staleTime: 2 * 60 * 1000, // 2 min
  });
}

// ── Mutations ────────────────────────────────────────

export function useUploadProductImage() {
  return useMutation({
    mutationFn: (file: File) => adminProductService.uploadImage(file),
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteProductImage() {
  return useMutation({
    mutationFn: (url: string) => adminProductService.deleteImage(url),
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUploadProductVideo() {
  return useMutation({
    mutationFn: (file: File) => adminProductService.uploadVideo(file),
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteProductVideo() {
  return useMutation({
    mutationFn: (url: string) => adminProductService.deleteVideo(url),
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProductInput) => adminProductService.createProduct(data),
    onSuccess: () => {
      toast.success('პროდუქტი შეიქმნა');
      queryClient.invalidateQueries({ queryKey: adminProductKeys.all });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}


export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductInput }) =>
      adminProductService.updateProduct(id, data),
    onSuccess: () => {
      toast.success('პროდუქტი განახლდა');
      queryClient.invalidateQueries({ queryKey: adminProductKeys.all });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useToggleProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminProductService.toggleActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminProductKeys.all });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminProductService.deleteProduct(id),
    onSuccess: () => {
      toast.success('პროდუქტი წაიშალა');
      queryClient.invalidateQueries({ queryKey: adminProductKeys.all });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useBatchToggle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, isActive }: { ids: string[]; isActive: boolean }) =>
      adminProductService.batchToggle(ids, isActive),
    onSuccess: (_, { isActive }) => {
      toast.success(isActive ? 'პროდუქტები გააქტიურდა' : 'პროდუქტები დაიმალა');
      queryClient.invalidateQueries({ queryKey: adminProductKeys.all });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useBatchDelete() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => adminProductService.batchDelete(ids),
    onSuccess: () => {
      toast.success('პროდუქტები წაიშალა');
      queryClient.invalidateQueries({ queryKey: adminProductKeys.all });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
