'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { CategoryTree } from './CategoryTree';
import { DynamicFilterSection } from './DynamicFilterSection';
import { PriceRangeFilter } from './PriceRangeFilter';
import { useLocale } from '@/lib/i18n';
import type { FilterFieldConfig, CategoryNode, SpecValueOption } from '../types/catalog.types';

interface CatalogSidebarProps {
  categoryTree: CategoryNode[];
  categoryCounts: Record<string, number>;
  filterConfigs: FilterFieldConfig[];
  availableValues: Record<string, SpecValueOption[]>;
  priceRange: { min: number; max: number };
}

export function CatalogSidebar({
  categoryTree,
  categoryCounts,
  filterConfigs,
  availableValues,
  priceRange,
}: CatalogSidebarProps): React.ReactElement {
  const { t } = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const hasActiveSpecFilters = filterConfigs.some((c) => searchParams.get(c.id));
  const hasPriceFilter = searchParams.get('minPrice') || searchParams.get('maxPrice');
  const hasInStockFilter = searchParams.get('inStock') === 'true';
  const hasFilters = hasActiveSpecFilters || hasPriceFilter || hasInStockFilter;

  function clearAllFilters(): void {
    const params = new URLSearchParams();
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    if (category) params.set('category', category);
    if (subcategory) params.set('subcategory', subcategory);
    router.push(`${pathname}?${params.toString()}`);
  }

  function toggleInStock(checked: boolean): void {
    const params = new URLSearchParams(searchParams.toString());
    if (checked) {
      params.set('inStock', 'true');
    } else {
      params.delete('inStock');
    }
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      {/* Category tree */}
      <CategoryTree categoryTree={categoryTree} categoryCounts={categoryCounts} />

      {/* Divider */}
      {filterConfigs.length > 0 && (
        <div className="border-t border-border" />
      )}

      {/* Filters header + clear */}
      {filterConfigs.length > 0 && (
        <div className="flex items-center justify-between px-3">
          <p className="text-sm font-semibold text-foreground">{t('catalog.filters')}</p>
          {hasFilters && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-primary hover:text-primary/80 transition-colors cursor-pointer"
            >
              {t('catalog.clearFilters')}
            </button>
          )}
        </div>
      )}

      {/* Dynamic spec filters */}
      <div className="px-3">
        <DynamicFilterSection
          filterConfigs={filterConfigs}
          availableValues={availableValues}
        />
      </div>

      {/* Price range */}
      {filterConfigs.length > 0 && (
        <>
          <div className="border-t border-border" />
          <div className="px-3">
            <PriceRangeFilter min={priceRange.min} max={priceRange.max} />
          </div>
        </>
      )}

      {/* In stock filter */}
      <div className="border-t border-border" />
      <div className="px-3">
        <div className="flex items-center gap-2">
          <Checkbox
            id="inStock-filter"
            checked={hasInStockFilter}
            onCheckedChange={(checked) => toggleInStock(checked === true)}
          />
          <Label htmlFor="inStock-filter" className="text-sm text-foreground cursor-pointer">
            {t('catalog.inStockOnly')}
          </Label>
        </div>
      </div>
    </div>
  );
}
