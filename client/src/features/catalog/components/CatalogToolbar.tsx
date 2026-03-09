'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { X, MagnifyingGlass } from '@phosphor-icons/react';
import { useDebounce } from '@/hooks/useDebounce';
import { useLocale } from '@/lib/i18n';
import type { FilterFieldConfig } from '../types/catalog.types';

interface CatalogToolbarProps {
  totalProducts: number;
  filterConfigs: FilterFieldConfig[];
  filterSlot?: React.ReactNode;
}

export function CatalogToolbar({
  totalProducts,
  filterConfigs,
  filterSlot,
}: CatalogToolbarProps): React.ReactElement {
  const { t, localized } = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get('sort') ?? 'newest';
  const currentLimit = searchParams.get('limit') ?? '16';
  const currentSearch = searchParams.get('search') ?? '';

  const [searchInput, setSearchInput] = useState(currentSearch);
  const debouncedSearch = useDebounce(searchInput, 400);

  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSearch) {
      params.set('search', debouncedSearch);
    } else {
      params.delete('search');
    }
    params.delete('page');
    const target = `${pathname}?${params.toString()}`;
    const current = `${pathname}?${searchParams.toString()}`;
    if (target !== current) {
      router.push(target);
    }
  }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  function setParam(key: string, value: string, defaultValue: string): void {
    const params = new URLSearchParams(searchParams.toString());
    if (value === defaultValue) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  }

  const activeChips: { label: string; paramKey: string; value: string }[] = [];

  for (const config of filterConfigs) {
    const raw = searchParams.get(config.id);
    if (raw) {
      const values = raw.split(',').filter(Boolean);
      for (const v of values) {
        activeChips.push({
          label: `${localized(config.label)}: ${v}`,
          paramKey: config.id,
          value: v,
        });
      }
    }
  }

  if (currentSearch) {
    activeChips.push({ label: t('catalog.chipSearch', { value: currentSearch }), paramKey: 'search', value: '' });
  }

  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  if (minPrice) {
    activeChips.push({ label: t('catalog.chipPriceMin', { value: minPrice }), paramKey: 'minPrice', value: '' });
  }
  if (maxPrice) {
    activeChips.push({ label: t('catalog.chipPriceMax', { value: maxPrice }), paramKey: 'maxPrice', value: '' });
  }

  function removeChip(paramKey: string, value: string): void {
    const params = new URLSearchParams(searchParams.toString());

    if (paramKey === 'search') {
      params.delete('search');
      setSearchInput('');
    } else if (paramKey === 'minPrice' || paramKey === 'maxPrice') {
      params.delete(paramKey);
    } else {
      const raw = params.get(paramKey) ?? '';
      const values = raw.split(',').filter((v) => v !== value);
      if (values.length === 0) {
        params.delete(paramKey);
      } else {
        params.set(paramKey, values.join(','));
      }
    }

    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  }

  const selectClass =
    'px-2.5 py-1.5 rounded-lg bg-muted border border-border text-sm text-foreground focus:outline-none focus:border-primary transition-colors cursor-pointer';

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="relative">
        <MagnifyingGlass size={16} weight="bold" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" aria-hidden="true" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder={t('catalog.search')}
          className="w-full pl-9 pr-9 py-2 rounded-lg bg-muted border border-border text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          aria-label={t('catalog.search')}
        />
        {searchInput && (
          <button
            type="button"
            onClick={() => setSearchInput('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label={t('catalog.clearSearch')}
          >
            <X size={14} weight="bold" />
          </button>
        )}
      </div>

      {/* Controls row: filter button + count + sort + limit */}
      <div className="flex items-center gap-2 sm:gap-3">
        {filterSlot}

        <p className="text-sm text-muted-foreground whitespace-nowrap">
          <span className="font-medium text-foreground tabular-nums">{totalProducts}</span>{' '}
          <span className="hidden sm:inline">{t('catalog.product')}</span>
        </p>

        <div className="ml-auto flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Sort */}
          <select
            value={currentSort}
            onChange={(e) => setParam('sort', e.target.value, 'newest')}
            className={`${selectClass} min-w-0`}
            aria-label={t('catalog.sort')}
          >
            <option value="newest">{t('catalog.sortNewest')}</option>
            <option value="price-asc">{t('catalog.sortPriceAsc')}</option>
            <option value="price-desc">{t('catalog.sortPriceDesc')}</option>
            <option value="name-asc">{t('catalog.sortNameAsc')}</option>
          </select>

          {/* Items per page — hidden on smallest screens */}
          <select
            value={currentLimit}
            onChange={(e) => setParam('limit', e.target.value, '16')}
            className={`${selectClass} hidden sm:block`}
            aria-label={t('catalog.perPage')}
          >
            <option value="16">16</option>
            <option value="32">32</option>
            <option value="64">64</option>
          </select>
        </div>
      </div>

      {/* Active filter chips */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {activeChips.map((chip, i) => (
            <button
              key={`${chip.paramKey}-${chip.value}-${i}`}
              onClick={() => removeChip(chip.paramKey, chip.value)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors cursor-pointer"
            >
              {chip.label}
              <X size={12} weight="bold" aria-hidden="true" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
