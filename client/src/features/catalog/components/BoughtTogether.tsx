'use client';

import { useState, useCallback, useMemo } from 'react';

import Link from 'next/link';

import { SafeImage } from '@/components/common/SafeImage';
import { useCartStore } from '@/features/cart/store/cartStore';
import { useLocale } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { getProductImageUrl } from '../hooks/useCatalog';

import type { IProduct } from '../types/catalog.types';

interface BoughtTogetherProps {
  mainProduct: IProduct;
  relatedProducts: IProduct[];
}

export function BoughtTogether({ mainProduct, relatedProducts }: BoughtTogetherProps): React.ReactElement | null {
  const { t, localized } = useLocale();
  const addItem = useCartStore((s) => s.addItem);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(relatedProducts.map((p) => p.id))
  );
  const [added, setAdded] = useState(false);

  const handleToggle = useCallback((id: string): void => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectedProducts = useMemo(
    () => relatedProducts.filter((p) => selectedIds.has(p.id)),
    [relatedProducts, selectedIds]
  );

  const allProducts = useMemo(
    () => [mainProduct, ...selectedProducts],
    [mainProduct, selectedProducts]
  );

  const totalPrice = useMemo(
    () => allProducts.reduce((sum, p) => sum + p.price, 0),
    [allProducts]
  );

  const totalOriginalPrice = useMemo(
    () => allProducts.reduce((sum, p) => sum + (p.originalPrice ?? p.price), 0),
    [allProducts]
  );

  const hasSavings = totalOriginalPrice > totalPrice;

  const handleBuyAll = useCallback((): void => {
    addItem(mainProduct, 1);
    for (const product of selectedProducts) {
      addItem(product, 1);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }, [addItem, mainProduct, selectedProducts]);

  if (relatedProducts.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-foreground">
            {t('catalog.boughtTogether')}
          </h2>
          <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold tabular-nums">
            +{relatedProducts.length}
          </span>
        </div>
      </div>

      {/* Main product (always included, not removable) */}
      <BoughtTogetherItem
        product={mainProduct}
        isMain
        isSelected
      />

      {/* Related products */}
      {relatedProducts.map((product) => (
        <BoughtTogetherItem
          key={product.id}
          product={product}
          isSelected={selectedIds.has(product.id)}
          onToggle={handleToggle}
        />
      ))}

      {/* Footer: total + buy all */}
      <div className="flex items-center justify-between gap-4 px-5 py-4 border-t border-border bg-muted/30">
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] text-muted-foreground">
            {t('catalog.total', { count: allProducts.length })}
          </span>
          <div className="flex items-baseline gap-2">
            {hasSavings && (
              <span className="text-sm text-muted-foreground/60 line-through tabular-nums">
                {totalOriginalPrice.toLocaleString()} ₾
              </span>
            )}
            <span className="text-xl font-bold text-foreground tabular-nums">
              {totalPrice.toLocaleString()} ₾
            </span>
          </div>
        </div>

        <button
          onClick={handleBuyAll}
          disabled={added}
          className={cn(
            'flex items-center justify-center gap-2 h-10 px-6 rounded-xl text-sm font-medium',
            'transition-all duration-200 cursor-pointer',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
            'active:scale-[0.98]',
            added
              ? 'bg-green-600/10 text-green-500 border border-green-600/30'
              : 'bg-primary text-primary-foreground hover:brightness-110'
          )}
          aria-label="Buy all together"
        >
          {added ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
              </svg>
              <span>{t('catalog.buyAll')}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/* ─── Row item ─────────────────────────────────────────── */

interface BoughtTogetherItemProps {
  product: IProduct;
  isMain?: boolean;
  isSelected: boolean;
  onToggle?: (id: string) => void;
}

function BoughtTogetherItem({ product, isMain, isSelected, onToggle }: BoughtTogetherItemProps): React.ReactElement {
  const { localized } = useLocale();
  const name = localized(product.name);
  const hasImage = product.images.length > 0;
  const imageSrc = hasImage ? getProductImageUrl(product.images[0]) : null;
  const hasDiscount = product.originalPrice !== undefined && product.originalPrice > product.price;

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-5 py-3 border-b border-border/50 last:border-b-0',
        'transition-opacity duration-200',
        !isSelected && !isMain && 'opacity-40'
      )}
    >
      {/* Checkbox or bullet for main */}
      {isMain ? (
        <div className="w-5 h-5 flex items-center justify-center shrink-0">
          <div className="w-2 h-2 rounded-full bg-primary" />
        </div>
      ) : (
        <button
          onClick={() => onToggle?.(product.id)}
          className={cn(
            'w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 cursor-pointer',
            'transition-all duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
            isSelected
              ? 'bg-primary border-primary'
              : 'border-border hover:border-primary/50'
          )}
          aria-label={isSelected ? 'Remove' : 'Add'}
          aria-checked={isSelected}
          role="checkbox"
        >
          {isSelected && (
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={3} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          )}
        </button>
      )}

      {/* Thumbnail */}
      <div className="relative w-12 h-12 rounded-lg bg-muted overflow-hidden shrink-0">
        {imageSrc ? (
          <SafeImage
            src={imageSrc}
            alt={name}
            className="object-contain"
            sizes="48px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="text-border" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
            </svg>
          </div>
        )}
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground leading-snug line-clamp-2">
          {name}
        </p>
      </div>

      {/* Price */}
      <div className="flex flex-col items-end gap-0.5 shrink-0">
        {hasDiscount && (
          <span className="text-xs text-destructive/60 line-through tabular-nums">
            {product.originalPrice!.toLocaleString()} ₾
          </span>
        )}
        <span className={cn(
          'text-sm font-bold tabular-nums',
          hasDiscount ? 'text-destructive' : 'text-foreground'
        )}>
          {product.price.toLocaleString()} ₾
        </span>
      </div>

      {/* Link to product */}
      {!isMain && (
        <Link
          href={`/catalog/${product.slug}`}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors duration-150 shrink-0"
          aria-label={name}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
        </Link>
      )}
    </div>
  );
}
