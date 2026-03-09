/**
 * Site Settings Module — Service
 *
 * Business logic for site-wide settings (singleton).
 */

import { siteSettingsRepository } from './site-settings.repo.js';
import type { SiteSettingsData } from './site-settings.types.js';
import type { UpdateSiteSettingsInput } from './site-settings.schemas.js';

class SiteSettingsService {
  async getSettings(): Promise<SiteSettingsData> {
    return siteSettingsRepository.get();
  }

  async updateSettings(input: UpdateSiteSettingsInput): Promise<SiteSettingsData> {
    // Get current settings
    const current = await siteSettingsRepository.get();

    // Deep merge input into current settings
    const merged = this.deepMerge(
      current as unknown as Record<string, unknown>,
      input as unknown as Record<string, unknown>,
    ) as unknown as SiteSettingsData;

    // Persist merged settings
    return siteSettingsRepository.upsert(merged);
  }

  /**
   * Deep merge source into target. Only overrides defined values.
   */
  private deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
    const result = { ...target };

    for (const key of Object.keys(source)) {
      const sourceVal = source[key];
      const targetVal = target[key];

      if (sourceVal === undefined) continue;

      if (
        sourceVal !== null &&
        typeof sourceVal === 'object' &&
        !Array.isArray(sourceVal) &&
        targetVal !== null &&
        typeof targetVal === 'object' &&
        !Array.isArray(targetVal)
      ) {
        result[key] = this.deepMerge(
          targetVal as Record<string, unknown>,
          sourceVal as Record<string, unknown>,
        );
      } else {
        result[key] = sourceVal;
      }
    }

    return result;
  }
}

export const siteSettingsService = new SiteSettingsService();
