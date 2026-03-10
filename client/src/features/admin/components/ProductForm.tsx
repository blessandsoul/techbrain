'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ImageManager } from './ImageManager';
import { RelatedProductsPicker } from './RelatedProductsPicker';
import { SpecSuggestionsSection } from './SpecSuggestionsSection';
import { InfoTooltip } from './InfoTooltip';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from './RichTextEditor';
import { ROUTES } from '@/lib/constants/routes';
import { useAdminCategories, useCreateProduct, useUpdateProduct, useSpecSuggestions } from '../hooks/useAdminProducts';
import type { IProduct } from '@/features/catalog/types/catalog.types';
import type { ICategory, CreateProductInput, UpdateProductInput } from '../types/admin.types';

interface ProductFormProps {
  product?: IProduct;
}

interface SpecRow {
  key_ka: string;
  key_ru: string;
  key_en: string;
  value: string;
}

function generateSlug(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 200);
  return slug || `product-${Date.now()}`;
}

function mapCategorySlugToId(slug: string, categories: ICategory[]): string | null {
  const cat = categories.find((c) => c.slug === slug);
  return cat?.id ?? null;
}

export function ProductForm({ product }: ProductFormProps): React.ReactElement {
  const router = useRouter();
  const { data: categories = [], isLoading: categoriesLoading } = useAdminCategories();
  const { data: specSuggestions = [] } = useSpecSuggestions();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const isEditMode = !!product;

  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [isActiveChecked, setIsActiveChecked] = useState<boolean>(product?.isActive ?? true);
  const [isFeaturedChecked, setIsFeaturedChecked] = useState<boolean>(product?.isFeatured ?? false);
  const [selectedCategorySlugs, setSelectedCategorySlugs] = useState<string[]>(product?.categories ?? []);
  const [relatedIds, setRelatedIds] = useState<string[]>(product?.relatedProducts ?? []);
  const [nameKa, setNameKa] = useState(product?.name.ka ?? '');
  const [descriptionKa, setDescriptionKa] = useState(product?.description?.ka ?? '');
  const [price, setPrice] = useState(String(product?.price ?? 0));
  const [originalPrice, setOriginalPrice] = useState(String(product?.originalPrice ?? ''));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const [priceError, setPriceError] = useState<string | null>(null);

  // Suggested specs state: keyed by Georgian spec name (keyKa) → selected values
  const [suggestedSpecs, setSuggestedSpecs] = useState<Record<string, string[]>>(() => {
    const result: Record<string, string[]> = {};
    if (product?.specs) {
      for (const s of product.specs) {
        result[s.key.ka] = [...(result[s.key.ka] ?? []), s.value];
      }
    }
    return result;
  });

  // Custom specs: for adding entirely new spec keys not in suggestions
  const [customSpecs, setCustomSpecs] = useState<SpecRow[]>([]);

  // Once specSuggestions load, split existing product specs into suggested vs custom
  const specsSplitDone = useRef(false);
  useEffect(() => {
    if (specsSplitDone.current || !product?.specs?.length || specSuggestions.length === 0) return;
    specsSplitDone.current = true;

    const suggestionKeys = new Set(specSuggestions.map((s) => s.key.ka));
    const suggested: Record<string, string[]> = {};
    const custom: SpecRow[] = [];

    for (const s of product.specs) {
      if (suggestionKeys.has(s.key.ka)) {
        suggested[s.key.ka] = [...(suggested[s.key.ka] ?? []), s.value];
      } else {
        custom.push({ key_ka: s.key.ka, key_ru: s.key.ru, key_en: s.key.en, value: s.value });
      }
    }

    setSuggestedSpecs(suggested);
    if (custom.length > 0) setCustomSpecs(custom);
  }, [product?.specs, specSuggestions]);

  const handleSuggestedChange = useCallback((values: Record<string, string[]>): void => {
    setSuggestedSpecs(values);
  }, []);

  function addCustomSpec(): void {
    setCustomSpecs((s) => [...s, { key_ka: '', key_ru: '', key_en: '', value: '' }]);
  }

  function removeCustomSpec(i: number): void {
    setCustomSpecs((s) => s.filter((_, idx) => idx !== i));
  }

  function updateCustomSpec(i: number, field: keyof SpecRow, val: string): void {
    setCustomSpecs((s) => s.map((row, idx) => (idx === i ? { ...row, [field]: val } : row)));
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Map category slugs to UUIDs
      const categoryIds = selectedCategorySlugs
        .map((slug) => mapCategorySlugToId(slug, categories))
        .filter(Boolean) as string[];

      if (categoryIds.length === 0) {
        setCategoryError('აირჩიეთ მინიმუმ 1 კატეგორია');
        setIsSubmitting(false);
        return;
      }

      // Validate originalPrice > price
      const parsedPrice = Number(price) || 0;
      const parsedOrig = Number(originalPrice);
      if (parsedOrig > 0 && parsedOrig <= parsedPrice) {
        setPriceError('ძველი ფასი უნდა იყოს მიმდინარე ფასზე მეტი');
        setIsSubmitting(false);
        return;
      }
      setPriceError(null);

      // Build specs array from suggested specs + custom specs
      const suggestionMap = new Map(specSuggestions.map((s) => [s.key.ka, s.key]));
      const specs = [
        ...Object.entries(suggestedSpecs).flatMap(([keyKa, values]) => {
          const key = suggestionMap.get(keyKa) ?? { ka: keyKa, ru: '', en: '' };
          return values
            .filter((v) => v.trim())
            .map((value) => ({ key, value: value.trim() }));
        }),
        ...customSpecs
          .filter((s) => s.key_ka.trim() && s.value.trim())
          .map((s) => ({
            key: { ka: s.key_ka, ru: s.key_ru, en: s.key_en },
            value: s.value,
          })),
      ];

      const slug = generateSlug(nameKa) || `product-${Date.now()}`;

      const input: CreateProductInput = {
        slug,
        categoryIds,
        price: parsedPrice,
        originalPrice: parsedOrig > 0 ? parsedOrig : undefined,
        isActive: isActiveChecked,
        isFeatured: isFeaturedChecked,
        images,
        name: { ka: nameKa, ru: '', en: '' },
        description: descriptionKa ? { ka: descriptionKa } : undefined,
        specs,
        relatedProducts: relatedIds.length > 0 ? relatedIds : undefined,
      };

      if (isEditMode) {
        const updateInput: UpdateProductInput = { ...input };
        await updateMutation.mutateAsync({ id: product.id, data: updateInput });
      } else {
        await createMutation.mutateAsync(input);
      }
      router.push(ROUTES.ADMIN.DASHBOARD);
    } finally {
      setIsSubmitting(false);
    }
  }

  const labelClass = 'text-xs text-muted-foreground';

  // Hardcoded category options (used as fallback and for display)
  const categoryOptions = categories.length > 0
    ? categories.map((c) => ({ value: c.slug, label: c.name.ka }))
    : [
        { value: 'cameras', label: 'კამერები' },
        { value: 'nvr-kits', label: 'NVR კომპლექტები' },
        { value: 'accessories', label: 'აქსესუარები' },
        { value: 'storage', label: 'მეხსიერება' },
        { value: 'services', label: 'სერვისები' },
      ];

  const saveButtonDisabled = isSubmitting || createMutation.isPending || updateMutation.isPending;
  const saveButtonLabel = isSubmitting ? 'იტვირთება...' : 'პროდუქტის შენახვა';

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {/* Top save button */}
      <div className="flex justify-end mb-4">
        <Button type="submit" disabled={saveButtonDisabled}>
          {saveButtonLabel}
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card divide-y divide-border">
        <ImageManager images={images} setImages={setImages} />

        {/* Basic info */}
        <div className="p-4">
          <div className="grid grid-cols-4 gap-3">
            <div>
              <Label className={labelClass}>კატეგორიები <InfoTooltip text="პროდუქტის კატეგორიები — შეგიძლიათ აირჩიოთ ერთი ან რამდენიმე კატეგორია" /></Label>
              <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-1">
                {categoriesLoading ? (
                  <span className="text-xs text-muted-foreground">იტვირთება...</span>
                ) : (
                  categoryOptions.map((cat) => (
                    <div key={cat.value} className="flex items-center gap-1.5">
                      <Checkbox
                        id={`cat-${cat.value}`}
                        checked={selectedCategorySlugs.includes(cat.value)}
                        onCheckedChange={(checked) => {
                          setSelectedCategorySlugs((prev) => {
                            const next = checked
                              ? [...prev, cat.value]
                              : prev.filter((c) => c !== cat.value);
                            if (next.length > 0) setCategoryError(null);
                            return next;
                          });
                        }}
                      />
                      <Label htmlFor={`cat-${cat.value}`} className="text-xs text-muted-foreground cursor-pointer">{cat.label}</Label>
                    </div>
                  ))
                )}
              </div>
              {categoryError && (
                <p className="text-xs text-destructive mt-1">{categoryError}</p>
              )}
            </div>
            <div>
              <Label className={labelClass}>ფასი (₾) <InfoTooltip text="ფასი ლარებში. 0 ნიშნავს ფასი არ გამოჩნდება" /></Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div>
              <Label className={labelClass}>ძველი ფასი (₾) <InfoTooltip text="ძველი ფასი — თუ მითითებულია, გამოჩნდება გადახაზული ფასი და ფასდაკლების პროცენტი" /></Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                placeholder="არასავალდებულო"
              />
              {priceError && (
                <p className="text-xs text-destructive mt-1">{priceError}</p>
              )}
            </div>
            <div className="flex items-end gap-4 pb-1">
              <div className="flex items-center gap-1.5">
                <Checkbox
                  id="isActive"
                  checked={isActiveChecked}
                  onCheckedChange={(checked) => setIsActiveChecked(checked === true)}
                />
                <Label htmlFor="isActive" className="text-xs text-muted-foreground cursor-pointer">აქტიური <InfoTooltip text="გამორთვისას პროდუქტი არ გამოჩნდება საიტზე" /></Label>
              </div>
              <div className="flex items-center gap-1.5">
                <Checkbox
                  id="isFeatured"
                  checked={isFeaturedChecked}
                  onCheckedChange={(checked) => setIsFeaturedChecked(checked === true)}
                />
                <Label htmlFor="isFeatured" className="text-xs text-muted-foreground cursor-pointer">გამორჩეული <InfoTooltip text="ჩართვისას პროდუქტი გამოჩნდება მთავარ გვერდზე" /></Label>
              </div>
            </div>
          </div>
        </div>

        {/* Name */}
        <div className="p-4">
          <span className="block text-xs font-medium text-foreground uppercase tracking-wider mb-2">სახელი <InfoTooltip text="პროდუქტის სახელი" /></span>
          <Input
            value={nameKa}
            onChange={(e) => setNameKa(e.target.value)}
            placeholder="პროდუქტის სახელი"
            required
          />
        </div>

        {/* Description */}
        <div className="p-4">
          <span className="block text-xs font-medium text-foreground uppercase tracking-wider mb-2">აღწერა <InfoTooltip text="პროდუქტის აღწერა — გამოჩნდება პროდუქტის გვერდზე" /></span>
          <RichTextEditor
            content={descriptionKa}
            onChange={setDescriptionKa}
          />
        </div>

        {/* Related Products */}
        <div className="p-4">
          <span className="block text-xs font-medium text-foreground uppercase tracking-wider mb-2">
            ერთად შეძენა <InfoTooltip text="თანმხლები პროდუქტები — გამოჩნდება 'ასევე შეიძინეთ' სექციაში" />
          </span>
          <RelatedProductsPicker
            selectedCategorySlugs={selectedCategorySlugs}
            selectedIds={relatedIds}
            currentProductId={product?.id}
            onChange={setRelatedIds}
          />
        </div>

        {/* Spec Suggestions from existing products */}
        <div className="p-4">
          <span className="block text-xs font-medium text-foreground uppercase tracking-wider mb-2">
            ტექნიკური მახასიათებლები <InfoTooltip text="არსებული პროდუქტებიდან აგრეგირებული სპეციფიკაციები — აირჩიეთ შესაბამისი მნიშვნელობები" />
          </span>
          <SpecSuggestionsSection values={suggestedSpecs} onChange={handleSuggestedChange} />
        </div>

        {/* Custom Specs */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-foreground uppercase tracking-wider">
              დამატებითი სპეციფიკაციები <InfoTooltip text="სხვა პარამეტრები რომლებიც არ არის ზემოთ ჩამოთვლილი" />
            </span>
            <Button type="button" variant="ghost" size="sm" onClick={addCustomSpec}>
              + დამატება
            </Button>
          </div>
          {customSpecs.length === 0 ? (
            <p className="text-xs text-muted-foreground">დამატებითი სპეციფიკაციები არ არის.</p>
          ) : (
            <div className="space-y-1.5">
              {customSpecs.map((spec, i) => (
                <div key={i} className="grid grid-cols-3 gap-2 items-center">
                  <Input placeholder="პარამეტრი" value={spec.key_ka} onChange={(e) => updateCustomSpec(i, 'key_ka', e.target.value)} />
                  <Input placeholder="მნიშვნელობა" value={spec.value} onChange={(e) => updateCustomSpec(i, 'value', e.target.value)} />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeCustomSpec(i)} className="text-muted-foreground hover:text-destructive justify-self-start w-6 h-6" aria-label="სპეცის წაშლა">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom save button */}
      <Button type="submit" className="mt-4" disabled={saveButtonDisabled}>
        {saveButtonLabel}
      </Button>
    </form>
  );
}
