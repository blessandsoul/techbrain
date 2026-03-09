'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { getErrorMessage } from '@/lib/utils/error';
import { adminProductService } from '../services/admin-product.service';
import { catalogKeys } from '@/features/catalog/hooks/useCatalog';

import type { CatalogConfigResponse } from '@/features/catalog/types/catalog.types';

// ── Query Key Factory ────────────────────────────────

export const catalogConfigKeys = {
  all: ['catalog-config'] as const,
  detail: () => [...catalogConfigKeys.all, 'detail'] as const,
};

// ── Queries ──────────────────────────────────────────

export function useAdminCatalogConfig() {
  return useQuery({
    queryKey: catalogConfigKeys.detail(),
    queryFn: () => adminProductService.getCatalogConfig(),
    staleTime: 10 * 60 * 1000,
  });
}

// ── Mutations ────────────────────────────────────────

export function useUpdateCatalogConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CatalogConfigResponse) => adminProductService.updateCatalogConfig(data),
    onSuccess: (updatedConfig) => {
      queryClient.setQueryData(catalogConfigKeys.detail(), updatedConfig);
      queryClient.invalidateQueries({ queryKey: catalogKeys.config() });
      toast.success('შენახულია');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
