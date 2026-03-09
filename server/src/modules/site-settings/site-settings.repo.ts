/**
 * Site Settings Module — Repository
 *
 * Prisma queries for site settings (singleton pattern).
 */

import { prisma } from '@libs/prisma.js';
import type { SiteSettingsData } from './site-settings.types.js';
import { DEFAULT_SITE_SETTINGS } from './site-settings.types.js';

class SiteSettingsRepository {
  async get(): Promise<SiteSettingsData> {
    const row = await prisma.siteSetting.findUnique({ where: { id: 'singleton' } });
    if (!row) {
      return { ...DEFAULT_SITE_SETTINGS };
    }
    return row.data as unknown as SiteSettingsData;
  }

  async upsert(data: SiteSettingsData): Promise<SiteSettingsData> {
    const row = await prisma.siteSetting.upsert({
      where: { id: 'singleton' },
      create: {
        data: JSON.parse(JSON.stringify(data)),
      },
      update: {
        data: JSON.parse(JSON.stringify(data)),
      },
    });
    return row.data as unknown as SiteSettingsData;
  }
}

export const siteSettingsRepository = new SiteSettingsRepository();
