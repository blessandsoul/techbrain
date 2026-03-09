'use client';

import { useQuery } from '@tanstack/react-query';

import { siteSettingsService } from '@/features/admin/services/site-settings.service';
import { DEFAULT_SITE_SETTINGS } from '@/features/admin/types/site-settings.types';

import type { SiteSettingsData } from '@/features/admin/types/site-settings.types';

export const siteSettingsKeys = {
  all: ['site-settings'] as const,
  detail: () => [...siteSettingsKeys.all, 'detail'] as const,
};

/**
 * Public hook for consuming site settings on any page.
 * Uses React Query caching — multiple components calling this hook
 * will share a single API request.
 */
export function usePublicSiteSettings(): SiteSettingsData {
  const { data } = useQuery({
    queryKey: siteSettingsKeys.detail(),
    queryFn: () => siteSettingsService.getSettings(),
    staleTime: 10 * 60 * 1000,
  });

  return data ?? DEFAULT_SITE_SETTINGS;
}
