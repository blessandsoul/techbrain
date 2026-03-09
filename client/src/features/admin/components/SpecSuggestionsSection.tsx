'use client';

import { useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useSpecSuggestions } from '../hooks/useAdminProducts';

interface SpecsSectionProps {
  values: Record<string, string[]>;
  onChange: (values: Record<string, string[]>) => void;
}

export function SpecSuggestionsSection({ values, onChange }: SpecsSectionProps): React.ReactElement {
  const { data: suggestions = [], isLoading } = useSpecSuggestions();

  const toggleValue = useCallback(
    (keyKa: string, value: string): void => {
      const current = values[keyKa] ?? [];
      const isSelected = current.includes(value);
      onChange({
        ...values,
        [keyKa]: isSelected ? current.filter((v) => v !== value) : [...current, value],
      });
    },
    [values, onChange]
  );

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-4">
        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-muted-foreground">სპეციფიკაციების ჩატვირთვა...</span>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <p className="text-xs text-muted-foreground py-2">
        სპეციფიკაციები ჯერ არ არის. დაამატეთ ქვემოთ &quot;დამატებითი სპეციფიკაციების&quot; სექციიდან.
      </p>
    );
  }

  return (
    <div className="space-y-0.5">
      {suggestions.map((suggestion) => (
        <div key={suggestion.key.ka} className="flex items-start gap-3 py-2">
          <span className="text-xs text-muted-foreground w-36 shrink-0 pt-1">
            {suggestion.key.ka}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {suggestion.values.map((val) => {
              const isSelected = (values[suggestion.key.ka] ?? []).includes(val);
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => toggleValue(suggestion.key.ka, val)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-medium border transition-all duration-200 cursor-pointer',
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted/50 text-muted-foreground border-border hover:border-primary/40'
                  )}
                >
                  {val}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
