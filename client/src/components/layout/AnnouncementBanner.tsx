'use client';

import { useState } from 'react';
import { X } from '@phosphor-icons/react';
import { usePublicSiteSettings } from '@/hooks/useSiteSettings';
import { useLocale } from '@/lib/i18n';

export function AnnouncementBanner(): React.ReactElement | null {
  const { announcement } = usePublicSiteSettings();
  const { locale, t } = useLocale();
  const [dismissed, setDismissed] = useState(false);

  if (!announcement.enabled || dismissed) return null;

  // Pick text for the current locale, fall back to ka → ru → en
  const textMap: Record<string, string | undefined> = {
    ka: announcement.textKa,
    ru: announcement.textRu,
    en: announcement.textEn,
  };
  const text = textMap[locale] || announcement.textKa || announcement.textRu || announcement.textEn;
  if (!text) return null;

  return (
    <div className="relative bg-primary text-primary-foreground text-center text-sm py-2 px-10">
      <p className="leading-snug">{text}</p>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-white/10 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        aria-label={t('common.close')}
      >
        <X size={14} weight="bold" />
      </button>
    </div>
  );
}
