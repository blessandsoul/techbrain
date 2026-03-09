'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';
import { useLocale } from '@/lib/i18n';

interface PriceRangeFilterProps {
  min: number;
  max: number;
}

export function PriceRangeFilter({ min, max }: PriceRangeFilterProps): React.ReactElement | null {
  const { t } = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isInvalid = min >= max || max === 0;

  const currentMin = searchParams.get('minPrice');
  const currentMax = searchParams.get('maxPrice');

  const [localMin, setLocalMin] = useState<string>(currentMin ?? '');
  const [localMax, setLocalMax] = useState<string>(currentMax ?? '');

  const debouncedMin = useDebounce(localMin, 500);
  const debouncedMax = useDebounce(localMax, 500);

  const updateUrl = useCallback(
    (minVal: string, maxVal: string) => {
      const params = new URLSearchParams(searchParams.toString());

      const parsedMin = parseFloat(minVal);
      const parsedMax = parseFloat(maxVal);

      if (minVal && Number.isFinite(parsedMin) && parsedMin > min) {
        params.set('minPrice', String(parsedMin));
      } else {
        params.delete('minPrice');
      }

      if (maxVal && Number.isFinite(parsedMax) && parsedMax < max) {
        params.set('maxPrice', String(parsedMax));
      } else {
        params.delete('maxPrice');
      }

      params.delete('page');
      const target = `${pathname}?${params.toString()}`;
      const current = `${pathname}?${searchParams.toString()}`;
      if (target !== current) {
        router.push(target);
      }
    },
    [searchParams, pathname, router, min, max],
  );

  useEffect(() => {
    if (!isInvalid) {
      updateUrl(debouncedMin, debouncedMax);
    }
  }, [debouncedMin, debouncedMax, updateUrl, isInvalid]);

  useEffect(() => {
    setLocalMin(currentMin ?? '');
    setLocalMax(currentMax ?? '');
  }, [currentMin, currentMax]);

  if (isInvalid) return null;

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {t('catalog.price')}
      </p>

      <div className="flex items-center gap-2">
        <div className="flex-1">
          <input
            type="number"
            min={min}
            max={max}
            value={localMin}
            onChange={(e) => setLocalMin(e.target.value)}
            placeholder={String(min)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-muted border border-border text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors tabular-nums"
            aria-label={t('catalog.priceMin')}
          />
        </div>
        <span className="text-muted-foreground text-xs">—</span>
        <div className="flex-1">
          <input
            type="number"
            min={min}
            max={max}
            value={localMax}
            onChange={(e) => setLocalMax(e.target.value)}
            placeholder={String(max)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-muted border border-border text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors tabular-nums"
            aria-label={t('catalog.priceMax')}
          />
        </div>
        <span className="text-xs text-muted-foreground font-medium">₾</span>
      </div>

      <p className="text-[11px] text-muted-foreground tabular-nums">
        {min}₾ — {max}₾
      </p>
    </div>
  );
}
