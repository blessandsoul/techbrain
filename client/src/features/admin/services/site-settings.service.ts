import { apiClient } from '@/lib/api/axios.config';
import { API_ENDPOINTS } from '@/lib/constants/api-endpoints';

import type { ApiResponse } from '@/lib/api/api.types';
import type { SiteSettingsData } from '../types/site-settings.types';

class SiteSettingsService {
  async getSettings(): Promise<SiteSettingsData> {
    const response = await apiClient.get<ApiResponse<SiteSettingsData>>(
      API_ENDPOINTS.SITE_SETTINGS.GET,
    );
    return response.data.data;
  }

  async updateSettings(data: SiteSettingsData): Promise<SiteSettingsData> {
    const response = await apiClient.put<ApiResponse<SiteSettingsData>>(
      API_ENDPOINTS.SITE_SETTINGS.UPDATE,
      data,
    );
    return response.data.data;
  }
}

export const siteSettingsService = new SiteSettingsService();
