'use client';

import { FilterCheckboxGroup } from './FilterCheckboxGroup';
import { useLocale } from '@/lib/i18n';
import type { FilterFieldConfig, SpecValueOption } from '../types/catalog.types';

interface DynamicFilterSectionProps {
  filterConfigs: FilterFieldConfig[];
  availableValues: Record<string, SpecValueOption[]>;
}

export function DynamicFilterSection({
  filterConfigs,
  availableValues,
}: DynamicFilterSectionProps): React.ReactElement | null {
  const { localized } = useLocale();
  const visibleConfigs = filterConfigs.filter(
    (config) => (availableValues[config.id]?.length ?? 0) > 0,
  );

  if (visibleConfigs.length === 0) return null;

  return (
    <div className="space-y-4">
      {visibleConfigs.map((config) => (
        <FilterCheckboxGroup
          key={config.id}
          label={localized(config.label)}
          paramKey={config.id}
          options={availableValues[config.id] ?? []}
          defaultExpanded={config.defaultExpanded}
        />
      ))}
    </div>
  );
}
