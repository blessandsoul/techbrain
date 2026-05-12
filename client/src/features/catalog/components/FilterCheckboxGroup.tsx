'use client';

import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { CaretDown } from '@phosphor-icons/react';
import { Checkbox } from '@/components/ui/checkbox';
import { useLocale } from '@/lib/i18n';
import type { SpecValueOption } from '../types/catalog.types';

const INITIAL_SHOW_COUNT = 5;

interface FilterCheckboxGroupProps {
  label: string;
  paramKey: string;
  options: SpecValueOption[];
  defaultExpanded?: boolean;
}

export function FilterCheckboxGroup({
  label,
  paramKey,
  options,
  defaultExpanded = false,
}: FilterCheckboxGroupProps): React.ReactElement | null {
  const { t } = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [showAll, setShowAll] = useState(false);

  if (options.length === 0) return null;

  const currentRaw = searchParams.get(paramKey) ?? '';
  const selectedValues = currentRaw ? currentRaw.split(',').filter(Boolean) : [];

  function toggleValue(value: string): void {
    const params = new URLSearchParams(searchParams.toString());
    let values = [...selectedValues];

    if (values.includes(value)) {
      values = values.filter((v) => v !== value);
    } else {
      values.push(value);
    }

    if (values.length === 0) {
      params.delete(paramKey);
    } else {
      params.set(paramKey, values.join(','));
    }

    params.delete('page');

    router.push(`${pathname}?${params.toString()}`);
  }

  const visibleOptions = showAll ? options : options.slice(0, INITIAL_SHOW_COUNT);
  const hasMore = options.length > INITIAL_SHOW_COUNT;

  return (
    <div className="space-y-2">
      {/* Header */}
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between py-2 px-3 rounded-lg cursor-pointer group hover:bg-muted transition-colors"
      >
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider group-hover:text-foreground transition-colors">
          {label}
        </span>
        <CaretDown
          size={14}
          weight="bold"
          className={`text-muted-foreground transition-transform duration-200 ${
            expanded ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Options — animated collapse via grid-template-rows */}
      <div
        className={`grid motion-safe:transition-[grid-template-rows,opacity] duration-200 ease-out ${
          expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
        aria-hidden={!expanded}
      >
        <div className="overflow-hidden">
          <div className="space-y-0.5">
            {visibleOptions.map((opt) => {
              const isSelected = selectedValues.includes(opt.value);
              const isDisabled = opt.count === 0 && !isSelected;

              const checkboxId = `filter-${paramKey}-${opt.value}`;
              return (
                <label
                  key={opt.value}
                  htmlFor={checkboxId}
                  className={`flex items-center gap-2.5 py-2 px-3 rounded-lg transition-colors ${
                    isDisabled
                      ? 'opacity-40 cursor-not-allowed'
                      : 'hover:bg-muted cursor-pointer'
                  }`}
                >
                  <Checkbox
                    id={checkboxId}
                    checked={isSelected}
                    disabled={isDisabled}
                    onCheckedChange={() => toggleValue(opt.value)}
                    tabIndex={expanded ? 0 : -1}
                  />
                  <span className="text-sm text-foreground flex-1 leading-tight">{opt.value}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">{opt.count}</span>
                </label>
              );
            })}

            {hasMore && (
              <button
                onClick={() => setShowAll((prev) => !prev)}
                tabIndex={expanded ? 0 : -1}
                className="text-xs text-primary hover:text-primary/80 transition-colors cursor-pointer mt-1 px-3 py-1"
              >
                {showAll
                  ? t('catalog.showLess')
                  : t('catalog.showMore', { count: options.length - INITIAL_SHOW_COUNT })}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
