'use client';

import { useCallback, useMemo, useState } from 'react';
import { Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { FilterFieldConfig } from '@/features/catalog/types/catalog.types';

// Filters that are not picked as spec values on a product.
const NON_SPEC_KEYS = new Set(['ფასი', 'მარაგი']);

interface CategorySpecPickerProps {
  filters: Record<string, FilterFieldConfig[]>;
  values: Record<string, string[]>;
  onChange: (values: Record<string, string[]>) => void;
  // Add/remove an option in the shared catalog vocabulary for a spec.
  onAddOption: (specKaKey: string, value: string) => void;
  onDeleteOption: (specKaKey: string, value: string) => void;
}

export function CategorySpecPicker({
  filters,
  values,
  onChange,
  onAddOption,
  onDeleteOption,
}: CategorySpecPickerProps): React.ReactElement {
  const [deleteMode, setDeleteMode] = useState(false);

  // Show ALL spec filters across every category (deduped by specKaKey),
  // excluding price/stock — always visible regardless of category selection.
  const applicableFilters = useMemo(() => {
    const seen = new Set<string>();
    const out: FilterFieldConfig[] = [];
    for (const list of Object.values(filters)) {
      for (const f of list) {
        if (NON_SPEC_KEYS.has(f.specKaKey)) continue;
        if (seen.has(f.specKaKey)) continue;
        seen.add(f.specKaKey);
        out.push(f);
      }
    }
    return out;
  }, [filters]);

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

  if (applicableFilters.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-5 text-center">
        <p className="text-xs text-muted-foreground">ფილტრები იტვირთება...</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Toolbar: toggle delete mode */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setDeleteMode((d) => !d)}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer active:scale-[0.97]',
            deleteMode
              ? 'border-destructive bg-destructive text-white'
              : 'border-border text-muted-foreground hover:border-destructive/40 hover:text-destructive',
          )}
        >
          {deleteMode ? (
            <>დასრულება</>
          ) : (
            <>
              <Trash2 className="h-3.5 w-3.5" />
              წაშლა
            </>
          )}
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border divide-y divide-border">
        {applicableFilters.map((filter) => {
          const selected = values[filter.specKaKey] ?? [];
          // Options come from the shared config vocabulary, plus whatever is
          // already selected on this product (so edits never lose a value).
          const optionList = Array.from(new Set([...(filter.options ?? []), ...selected]));

          return (
            <SpecFilterRow
              key={filter.id}
              label={filter.label.ka}
              options={optionList}
              selected={selected}
              deleteMode={deleteMode}
              onToggle={(value) => toggleValue(filter.specKaKey, value)}
              onAdd={(value) => onAddOption(filter.specKaKey, value)}
              onDelete={(value) => onDeleteOption(filter.specKaKey, value)}
            />
          );
        })}
      </div>
    </div>
  );
}

// ── Single filter row ─────────────────────────────────

interface SpecFilterRowProps {
  label: string;
  options: string[];
  selected: string[];
  deleteMode: boolean;
  onToggle: (value: string) => void;
  onAdd: (value: string) => void;
  onDelete: (value: string) => void;
}

function SpecFilterRow({
  label,
  options,
  selected,
  deleteMode,
  onToggle,
  onAdd,
  onDelete,
}: SpecFilterRowProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState('');

  function addCustom(): void {
    const value = custom.trim();
    if (!value) return;
    onAdd(value); // appends to the shared vocabulary; shows as an unselected pill
    setCustom('');
    setOpen(false);
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
              onClick={() => (deleteMode ? onDelete(val) : onToggle(val))}
              aria-label={deleteMode ? `წაშლა: ${val}` : val}
              className={cn(
                'inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium transition-all duration-150 cursor-pointer active:scale-[0.97]',
                deleteMode
                  ? 'border-destructive/40 bg-destructive/5 text-destructive hover:border-destructive hover:bg-destructive/10'
                  : isSelected
                    ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                    : 'border-border bg-muted/40 text-muted-foreground hover:border-primary/40 hover:text-foreground',
              )}
            >
              {val}
              {deleteMode && <X className="h-3 w-3" />}
            </button>
          );
        })}

        {/* Add a new value to this spec's vocabulary (hidden in delete mode) */}
        {!deleteMode && (
          <Popover
            open={open}
            onOpenChange={(next) => {
              setOpen(next);
              if (!next) setCustom('');
            }}
          >
            <PopoverTrigger asChild>
              <button
                type="button"
                className="rounded-lg border border-dashed border-border px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary active:scale-[0.97] cursor-pointer"
              >
                + დამატება
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-64 p-3">
              <p className="mb-2 text-xs font-semibold text-foreground">
                {label} — ახალი მნიშვნელობა
              </p>
              <div className="flex items-center gap-2">
                <Input
                  autoFocus
                  value={custom}
                  onChange={(e) => setCustom(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustom();
                    }
                  }}
                  placeholder="აკრიფეთ..."
                  className="h-8 flex-1 text-xs"
                />
                <button
                  type="button"
                  onClick={addCustom}
                  disabled={!custom.trim()}
                  className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-all hover:brightness-110 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  დამატება
                </button>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
}
