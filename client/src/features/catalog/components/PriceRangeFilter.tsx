'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
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

  const currentMin = searchParams.get('minPrice') ?? '';
  const currentMax = searchParams.get('maxPrice') ?? '';

  const [localMin, setLocalMin] = useState<string>(currentMin);
  const [localMax, setLocalMax] = useState<string>(currentMax);

  // Latest router context for the debounced writer — kept in a ref so the
  // pending timer always reads fresh values without restarting on each render.
  const latest = useRef({ searchParams, pathname });
  latest.current = { searchParams, pathname };

  // Holds the pending debounce timer. While it's non-null the user is actively
  // editing, so we ignore URL changes (they're just the async echo of our own
  // push). Set back to null the moment the timer fires.
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Write the price params to the URL, 300ms after the user stops typing.
  // Whatever number is entered is applied as-is — no "must be inside the range"
  // guard, which previously dropped values at/below the floor (the placeholder).
  function schedulePush(minVal: string, maxVal: string): void {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      const { searchParams: sp, pathname: pn } = latest.current;
      const params = new URLSearchParams(sp.toString());

      const parsedMin = parseFloat(minVal);
      const parsedMax = parseFloat(maxVal);

      if (minVal !== '' && Number.isFinite(parsedMin)) params.set('minPrice', String(parsedMin));
      else params.delete('minPrice');
      if (maxVal !== '' && Number.isFinite(parsedMax)) params.set('maxPrice', String(parsedMax));
      else params.delete('maxPrice');

      params.delete('page');
      const target = `${pn}?${params.toString()}`;
      const current = `${pn}?${sp.toString()}`;
      if (target !== current) router.push(target);
    }, 300);
  }

  // Sync the inputs from the URL only when idle (no pending edit). This handles
  // external changes (category switch, "clear filters", browser back) while
  // ignoring the async echo of our own push mid-typing.
  useEffect(() => {
    if (timerRef.current) return;
    setLocalMin(currentMin);
    setLocalMax(currentMax);
  }, [currentMin, currentMax]);

  // Clean up the debounce timer on unmount.
  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  if (isInvalid) return null;

  function handleMinChange(value: string): void {
    setLocalMin(value);
    schedulePush(value, localMax);
  }

  function handleMaxChange(value: string): void {
    setLocalMax(value);
    schedulePush(localMin, value);
  }

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
            onChange={(e) => handleMinChange(e.target.value)}
            placeholder={String(min)}
            className="no-spinner w-full px-2.5 py-1.5 rounded-lg bg-muted border border-border text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors tabular-nums"
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
            onChange={(e) => handleMaxChange(e.target.value)}
            placeholder={String(max)}
            className="no-spinner w-full px-2.5 py-1.5 rounded-lg bg-muted border border-border text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors tabular-nums"
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
