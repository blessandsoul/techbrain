'use client';

import { useState, useMemo, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getProductImageUrl } from '@/features/catalog/hooks/useCatalog';
import { useAdminProducts } from '../hooks/useAdminProducts';
import type { IProduct } from '@/features/catalog/types/catalog.types';

interface RelatedProductsPickerProps {
  selectedCategorySlugs: string[];
  selectedIds: string[];
  currentProductId?: string;
  onChange: (ids: string[]) => void;
}

const categoryLabel: Record<string, string> = {
  cameras: 'CAM',
  'nvr-kits': 'NVR',
  accessories: 'ACC',
  storage: 'HDD',
  services: 'SVC',
};

export function RelatedProductsPicker({
  selectedCategorySlugs,
  selectedIds,
  currentProductId,
  onChange,
}: RelatedProductsPickerProps): React.ReactElement {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);

  const cat1 = selectedCategorySlugs[0];
  const cat2 = selectedCategorySlugs[1];
  const cat3 = selectedCategorySlugs[2];

  // Fetch products for each selected category (max 3 queries)
  const { data: data1, isLoading: loading1 } = useAdminProducts(
    cat1 ? { category: cat1, limit: 100 } : { limit: 0 },
  );
  const { data: data2, isLoading: loading2 } = useAdminProducts(
    cat2 ? { category: cat2, limit: 100 } : { limit: 0 },
  );
  const { data: data3 } = useAdminProducts(
    cat3 ? { category: cat3, limit: 100 } : { limit: 0 },
  );

  const categoryLoading = loading1 || loading2;

  // Merge and deduplicate products from all selected categories
  const categoryProducts = useMemo(() => {
    const map = new Map<string, IProduct>();
    for (const item of [...(data1?.items ?? []), ...(data2?.items ?? []), ...(data3?.items ?? [])]) {
      map.set(item.id, item);
    }
    return Array.from(map.values());
  }, [data1, data2, data3]);

  // Fetch selected products separately so they resolve even if from a different category
  const { data: allData } = useAdminProducts(
    selectedIds.length > 0 ? { limit: 100 } : { limit: 0 },
  );
  const allProducts = allData?.items ?? [];

  const selectedProducts = useMemo(
    () =>
      selectedIds
        .map((id) => allProducts.find((p) => p.id === id) ?? categoryProducts.find((p) => p.id === id))
        .filter(Boolean) as IProduct[],
    [selectedIds, allProducts, categoryProducts],
  );

  const availableProducts = useMemo(
    () => categoryProducts.filter((p) => p.id !== currentProductId && !selectedIds.includes(p.id)),
    [categoryProducts, currentProductId, selectedIds],
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return availableProducts;
    const q = search.toLowerCase();
    return availableProducts.filter(
      (p) =>
        p.name.ka.toLowerCase().includes(q) ||
        p.name.ru.toLowerCase().includes(q) ||
        p.name.en.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q),
    );
  }, [availableProducts, search]);

  const handleAdd = useCallback(
    (id: string): void => {
      onChange([...selectedIds, id]);
      setSearch('');
      setOpen(false);
    },
    [selectedIds, onChange],
  );

  const handleRemove = useCallback(
    (id: string): void => {
      onChange(selectedIds.filter((sid) => sid !== id));
    },
    [selectedIds, onChange],
  );

  return (
    <div>
      {selectedProducts.length > 0 && (
        <div className="space-y-1.5 mb-3">
          {selectedProducts.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-1.5"
            >
              {p.images[0] && (
                <img
                  src={getProductImageUrl(p.images[0])}
                  alt=""
                  className="w-7 h-7 rounded object-cover shrink-0"
                />
              )}
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                {p.categories.map((c) => categoryLabel[c] ?? c).join('/')}
              </span>
              <span className="text-sm text-foreground truncate flex-1">{p.name.ka}</span>
              <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                {p.price} ₾
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemove(p.id)}
                className="text-muted-foreground hover:text-destructive shrink-0 w-6 h-6"
                aria-label={`წაშლა: ${p.name.ka}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-3.5 h-3.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="relative">
        <Input
          placeholder={
            selectedCategorySlugs.length === 0
              ? 'ჯერ აირჩიეთ კატეგორია…'
              : 'პროდუქტის ძებნა დასამატებლად…'
          }
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          disabled={selectedCategorySlugs.length === 0}
        />
        {open && selectedCategorySlugs.length > 0 && (search.trim() || availableProducts.length > 0) && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute z-20 top-full left-0 right-0 mt-1 rounded-lg border border-border bg-popover shadow-lg max-h-52 overflow-y-auto">
              {categoryLoading ? (
                <p className="text-xs text-muted-foreground px-3 py-4 text-center">
                  იტვირთება…
                </p>
              ) : filtered.length === 0 ? (
                <p className="text-xs text-muted-foreground px-3 py-4 text-center">
                  პროდუქტები ვერ მოიძებნა
                </p>
              ) : (
                filtered.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleAdd(p.id)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-left transition-colors duration-150 hover:bg-muted/50 cursor-pointer"
                  >
                    {p.images[0] && (
                      <img
                        src={getProductImageUrl(p.images[0])}
                        alt=""
                        className="w-7 h-7 rounded object-cover shrink-0"
                      />
                    )}
                    <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                      {p.categories.map((c) => categoryLabel[c] ?? c).join('/')}
                    </span>
                    <span className="text-sm text-foreground truncate flex-1">{p.name.ka}</span>
                    <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                      {p.price} ₾
                    </span>
                  </button>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {selectedProducts.length === 0 && (
        <p className="text-xs text-muted-foreground mt-1.5">
          ცარიელის შემთხვევაში ავტომატურად შეირჩევა მსგავსი კატეგორიიდან.
        </p>
      )}
    </div>
  );
}
