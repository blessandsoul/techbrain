'use client';

import { useCallback, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
      <p className="text-xs text-muted-foreground py-2">
        ჯერ აირჩიეთ კატეგორია — ფილტრები კატეგორიის მიხედვით გამოჩნდება.
      </p>
    );
  }

  if (applicableFilters.length === 0) {
    return (
      <p className="text-xs text-muted-foreground py-2">
        ამ კატეგორიას ფილტრები არ აქვს.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {applicableFilters.map((filter) => {
        const selected = values[filter.specKaKey] ?? [];
        const predefined = filter.options ?? [];
        // Show predefined ∪ existing product values ∪ any currently-selected custom values.
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
    <div className="flex items-start gap-3 py-1">
      <span className="text-xs text-muted-foreground w-36 shrink-0 pt-1.5">{label}</span>
      <div className="flex flex-wrap items-center gap-1.5 flex-1">
        {options.map((val) => {
          const isSelected = selected.includes(val);
          return (
            <button
              key={val}
              type="button"
              onClick={() => onToggle(val)}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-medium border transition-all duration-200 cursor-pointer',
                isSelected
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-muted/50 text-muted-foreground border-border hover:border-primary/40',
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
              className="h-7 w-32 text-xs"
            />
            <Button type="button" variant="ghost" size="sm" className="h-7 px-2" onClick={addCustom}>
              + დამატება
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
