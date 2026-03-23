'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Funnel, X } from '@phosphor-icons/react';
import { useLocale } from '@/lib/i18n';
import type { FilterFieldConfig } from '../types/catalog.types';

interface MobileFilterDrawerProps {
  filterConfigs: FilterFieldConfig[];
  children: React.ReactNode;
}

export function MobileFilterDrawer({
  filterConfigs,
  children,
}: MobileFilterDrawerProps): React.ReactElement {
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  let activeFilterCount = 0;
  for (const config of filterConfigs) {
    const raw = searchParams.get(config.id);
    if (raw) activeFilterCount += raw.split(',').filter(Boolean).length;
  }
  if (searchParams.get('minPrice')) activeFilterCount++;
  if (searchParams.get('maxPrice')) activeFilterCount++;
  if (searchParams.get('inStock') === 'true') activeFilterCount++;

  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent): void {
      if (e.key === 'Escape') close();
    }

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, close]);

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold active:scale-[0.97] md:hover:brightness-110 transition-all duration-200 cursor-pointer shrink-0"
      >
        <Funnel size={16} weight="bold" aria-hidden="true" />
        {t('catalog.filters')}
        {activeFilterCount > 0 && (
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary-foreground text-primary text-[10px] font-bold">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Overlay + Drawer */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
            onClick={close}
            aria-hidden="true"
          />

          {/* Drawer */}
          <div className="fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-background border-r border-border z-50 lg:hidden flex flex-col animate-slide-in-left">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
              <h2 className="text-base font-semibold text-foreground">{t('catalog.filters')}</h2>
              <button
                onClick={close}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                aria-label={t('common.close')}
              >
                <X size={20} weight="bold" className="text-muted-foreground" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {children}
            </div>

            {/* Apply button */}
            <div className="p-4 border-t border-border shrink-0">
              <button
                onClick={close}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 active:scale-[0.98] transition-all duration-200 cursor-pointer"
              >
                {t('catalog.applyFilters')}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
