'use client';

import { useState } from 'react';

import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { CategoriesEditor } from './CategoriesEditor';
import { FiltersEditor } from './FiltersEditor';
import { useUpdateCatalogConfig } from '../hooks/useCatalogConfig';

import type { CatalogConfigResponse } from '@/features/catalog/types/catalog.types';

interface Props {
  initialConfig: CatalogConfigResponse;
}

function validateConfig(config: CatalogConfigResponse): string | null {
  for (const cat of config.categories) {
    if (!cat.id.trim()) {
      return `კატეგორიას "${cat.label.ka || '(უსახელო)'}" არ აქვს ID`;
    }
    if (!cat.label.ka.trim()) {
      return `კატეგორია "${cat.id}" — ქართული სახელი სავალდებულოა`;
    }
    if (cat.children) {
      for (const child of cat.children) {
        if (!child.label.ka.trim()) {
          return `ქვეკატეგორია "${child.id}" (${cat.label.ka}) — ქართული სახელი სავალდებულოა`;
        }
      }
    }
  }
  for (const [categoryId, filters] of Object.entries(config.filters)) {
    for (const filter of filters) {
      if (!filter.id.trim()) {
        return `ფილტრს კატეგორიაში "${categoryId}" არ აქვს ID`;
      }
      if (!filter.specKaKey.trim()) {
        return `ფილტრი "${filter.id}" (${categoryId}) — სპეც. გასაღები სავალდებულოა`;
      }
      if (!filter.label.ka.trim()) {
        return `ფილტრი "${filter.id}" (${categoryId}) — ქართული სახელი სავალდებულოა`;
      }
    }
  }
  return null;
}

export function CatalogSettingsEditor({ initialConfig }: Props): React.ReactElement {
  const [config, setConfig] = useState<CatalogConfigResponse>(initialConfig);
  const updateMutation = useUpdateCatalogConfig();

  function handleSave(): void {
    const error = validateConfig(config);
    if (error) {
      toast.error(error);
      return;
    }
    updateMutation.mutate(config);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="sticky top-0 z-10 flex items-center gap-3 py-3 bg-muted/50">
        <Button
          type="button"
          onClick={handleSave}
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending ? 'შენახვა...' : 'ცვლილებების შენახვა'}
        </Button>
        {updateMutation.isSuccess && (
          <span className="text-sm text-success">შენახულია</span>
        )}
        {updateMutation.isError && (
          <span className="text-sm text-destructive">შენახვა ვერ მოხერხდა</span>
        )}
      </div>

      <CategoriesEditor config={config} setConfig={setConfig} />
      <FiltersEditor config={config} setConfig={setConfig} />
    </div>
  );
}
