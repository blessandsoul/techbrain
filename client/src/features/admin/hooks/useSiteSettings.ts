'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { getErrorMessage } from '@/lib/utils/error';
import { siteSettingsService } from '../services/site-settings.service';

import type { SiteSettingsData } from '../types/site-settings.types';

// ── Query Key Factory ────────────────────────────────

export const siteSettingsKeys = {
  all: ['site-settings'] as const,
  detail: () => [...siteSettingsKeys.all, 'detail'] as const,
};

// ── Queries ──────────────────────────────────────────

export function useSiteSettings() {
  return useQuery({
    queryKey: siteSettingsKeys.detail(),
    queryFn: () => siteSettingsService.getSettings(),
    staleTime: 10 * 60 * 1000,
  });
}

// ── Mutations ────────────────────────────────────────

export function useUpdateSiteSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SiteSettingsData) => siteSettingsService.updateSettings(data),
    onSuccess: (updatedSettings) => {
      queryClient.setQueryData(siteSettingsKeys.detail(), updatedSettings);
      toast.success('შენახულია!');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
