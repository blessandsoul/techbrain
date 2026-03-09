'use client';

import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { useSiteSettings, useUpdateSiteSettings } from '../hooks/useSiteSettings';
import { DEFAULT_SITE_SETTINGS } from '../types/site-settings.types';
import {
  ContactSection,
  BusinessSection,
  HoursSection,
  StatsSection,
  AnnouncementSection,
  SocialSection,
} from './SiteSettingsSections';
import type { SiteSettingsData } from '../types/site-settings.types';

export function SiteSettingsEditor(): React.ReactElement {
  const { data: serverSettings, isLoading } = useSiteSettings();
  const updateMutation = useUpdateSiteSettings();
  const [settings, setSettings] = useState<SiteSettingsData>(DEFAULT_SITE_SETTINGS);

  useEffect(() => {
    if (serverSettings) {
      setSettings(serverSettings);
    }
  }, [serverSettings]);

  function update<K extends keyof SiteSettingsData>(section: K, data: Partial<SiteSettingsData[K]>): void {
    setSettings((prev) => ({ ...prev, [section]: { ...prev[section], ...data } }));
  }

  async function handleSave(): Promise<void> {
    updateMutation.mutate(settings);
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl">
        <div className="rounded-xl border border-border bg-card p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="grid grid-cols-3 gap-3">
              <div className="h-9 bg-muted rounded" />
              <div className="h-9 bg-muted rounded" />
              <div className="h-9 bg-muted rounded" />
            </div>
            <div className="h-4 bg-muted rounded w-1/4 mt-6" />
            <div className="grid grid-cols-3 gap-3">
              <div className="h-9 bg-muted rounded col-span-3" />
              <div className="h-9 bg-muted rounded" />
              <div className="h-9 bg-muted rounded" />
              <div className="h-9 bg-muted rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const sectionProps = { settings, update };

  return (
    <div className="max-w-2xl">
      <div className="sticky top-0 z-10 bg-muted/50 pb-4 flex items-center gap-3">
        <Button
          type="button"
          onClick={handleSave}
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending ? 'შენახვა...' : 'ცვლილებების შენახვა'}
        </Button>
        {updateMutation.isSuccess && (
          <span className="text-sm text-success">შენახულია!</span>
        )}
        {updateMutation.isError && (
          <span className="text-sm text-destructive">შეცდომა</span>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card divide-y divide-border">
        <ContactSection {...sectionProps} />
        <BusinessSection {...sectionProps} />
        <HoursSection {...sectionProps} />
        <StatsSection {...sectionProps} />
        <AnnouncementSection {...sectionProps} />
        <SocialSection {...sectionProps} />
      </div>
    </div>
  );
}
