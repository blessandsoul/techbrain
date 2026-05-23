'use client';

import { useCallback, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { useSpecSuggestions } from '../hooks/useAdminProducts';
import type { FilterFieldConfig } from '@/features/catalog/types/catalog.types';

// Filters that are not picked as spec values on a product.
const NON_SPEC_KEYS = new Set(['ფასი', 'მარაგი']);

interface CategorySpecPickerProps {
  selectedCategorySlugs: string[];
  filters: Record<string, FilterFieldConfig[]>;
  values: Record<string, string[]>;
  onChange: (values: Record<string, string[]>) => void;
}

export function CategorySpecPicker({
  selectedCategorySlugs,
  filters,
  values,
  onChange,
}: CategorySpecPickerProps): React.ReactElement {
  const { data: suggestions = [] } = useSpecSuggestions();

  // Existing product values per spec key (so admin-added customs reappear).
  const suggestionsByKey = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const s of suggestions) map.set(s.key.ka, s.values);
    return map;
  }, [suggestions]);

  // Applicable filters = union across selected categories, deduped by specKaKey,
  // excluding price/stock. Preserves first-seen order (priority within category).
  const applicableFilters = useMemo(() => {
    const seen = new Set<string>();
    const out: FilterFieldConfig[] = [];
    for (const slug of selectedCategorySlugs) {
      for (const f of filters[slug] ?? []) {
        if (NON_SPEC_KEYS.has(f.specKaKey)) continue;
        if (seen.has(f.specKaKey)) continue;
        seen.add(f.specKaKey);
        out.push(f);
      }
    }
    return out;
  }, [selectedCategorySlugs, filters]);

  const toggleValue = useCallback(
    (keyKa: string, value: string): void => {
      const current = values[keyKa] ?? [];
      const isSelected = current.includes(value);
      onChange({
        ...values,
        [keyKa]: isSelected ? current.filter((v) => v !== value) : [...current, value],
      });
    },
    [values, onChange],
  );

  if (selectedCategorySlugs.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-6 text-center">
        <p className="text-sm font-medium text-foreground">ჯერ აირჩიეთ კატეგორია</p>
        <p className="mt-1 text-xs text-muted-foreground">
          ფილტრები არჩეული კატეგორიის მიხედვით გამოჩნდება ამ ადგილას.
        </p>
      </div>
    );
  }

  if (applicableFilters.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-5 text-center">
        <p className="text-xs text-muted-foreground">ამ კატეგორიას ფილტრები არ აქვს.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border divide-y divide-border">
      {applicableFilters.map((filter) => {
        const selected = values[filter.specKaKey] ?? [];
        const predefined = filter.options ?? [];
        const extra = filter.allowCustom ? suggestionsByKey.get(filter.specKaKey) ?? [] : [];
        const optionList = Array.from(new Set([...predefined, ...extra, ...selected]));

        return (
          <SpecFilterRow
            key={filter.id}
            label={filter.label.ka}
            options={optionList}
            selected={selected}
            allowCustom={filter.allowCustom ?? false}
            onToggle={(value) => toggleValue(filter.specKaKey, value)}
          />
        );
      })}
    </div>
  );
}

// ── Single filter row ─────────────────────────────────

interface SpecFilterRowProps {
  label: string;
  options: string[];
  selected: string[];
  allowCustom: boolean;
  onToggle: (value: string) => void;
}

function SpecFilterRow({ label, options, selected, allowCustom, onToggle }: SpecFilterRowProps): React.ReactElement {
  const [custom, setCustom] = useState('');

  function addCustom(): void {
    const value = custom.trim();
    if (!value) return;
    if (!selected.includes(value)) onToggle(value);
    setCustom('');
  }

  return (
    <div className="flex flex-col gap-2 px-3 py-3 sm:flex-row sm:items-start sm:gap-4 hover:bg-muted/30 transition-colors">
      {/* Label + selected count */}
      <div className="flex shrink-0 items-center gap-1.5 sm:w-40 sm:pt-1">
        <span className="text-xs font-semibold text-foreground">{label}</span>
        {selected.length > 0 && (
          <span className="rounded-full bg-primary/10 px-1.5 text-[10px] font-bold leading-4 text-primary tabular-nums">
            {selected.length}
          </span>
        )}
      </div>

      {/* Pills + custom add */}
      <div className="flex flex-1 flex-wrap items-center gap-1.5">
        {options.map((val) => {
          const isSelected = selected.includes(val);
          return (
            <button
              key={val}
              type="button"
              onClick={() => onToggle(val)}
              className={cn(
                'rounded-lg border px-2.5 py-1 text-xs font-medium transition-all duration-150 cursor-pointer active:scale-[0.97]',
                isSelected
                  ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                  : 'border-border bg-muted/40 text-muted-foreground hover:border-primary/40 hover:text-foreground',
              )}
            >
              {val}
            </button>
          );
        })}

        {allowCustom && (
          <div className="flex items-center gap-1">
            <Input
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCustom();
                }
              }}
              placeholder="დამატება..."
              className="h-7 w-28 text-xs"
            />
            <button
              type="button"
              onClick={addCustom}
              disabled={!custom.trim()}
              className="rounded-lg border border-dashed border-border px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              + დამატება
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
