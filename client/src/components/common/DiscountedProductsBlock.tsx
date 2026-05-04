'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CaretLeft, CaretRight, Tag, Sparkle } from '@phosphor-icons/react';
import { ProductMiniCard } from './ProductMiniCard';
import { useDiscountedProducts, getProductImageUrl } from '@/features/catalog/hooks/useCatalog';
import { useLocale } from '@/lib/i18n';

import type { IProduct } from '@/features/catalog/types/catalog.types';

function toMiniCardProduct(product: IProduct, localized: (field: { ka: string; ru: string; en: string } | string) => string): {
  id: string;
  slug: string;
  categories: string[];
  price: number;
  originalPrice?: number;
  inStock: boolean;
  images: string[];
  name: string;
  specs: { key: string; value: string }[];
} {
  return {
    id: product.id,
    slug: product.slug,
    categories: product.categories,
    price: product.price,
    originalPrice: product.originalPrice,
    inStock: product.inStock,
    images: product.images.map(getProductImageUrl),
    name: localized(product.name),
    specs: product.specs.map((s) => ({
      key: localized(s.key),
      value: s.value,
    })),
  };
}

export function DiscountedProductsBlock(): React.ReactElement {
  const { data: products, isLoading } = useDiscountedProducts();
  const { t, localized } = useLocale();
  const saleProducts = products ?? [];

  const categoryLabels: Record<string, string> = {
    cameras: t('category.cameras'),
    'nvr-kits': t('category.nvr-kits'),
    storage: t('category.storage'),
    accessories: t('category.accessories'),
    services: t('category.services'),
  };

  const cardsRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = cardsRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = cardsRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      ro.disconnect();
    };
  }, [checkScroll]);

  // Re-check scroll state when products load/change
  useEffect(() => {
    checkScroll();
  }, [saleProducts, checkScroll]);

  const scroll = (dir: 'left' | 'right'): void => {
    cardsRef.current?.scrollBy({ left: dir === 'left' ? -280 : 280, behavior: 'smooth' });
    // Re-check after smooth scroll completes (scroll event may not fire reliably)
    setTimeout(checkScroll, 350);
  };

  if (!isLoading && saleProducts.length === 0) return <></>;

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-muted animate-pulse" />
            <div className="h-4 w-40 rounded bg-muted animate-pulse" />
          </div>
        </div>
        <div className="p-4">
          <div className="flex gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-50 sm:w-56 shrink-0 h-48 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/20">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-success/10 border border-success/20 flex items-center justify-center shrink-0">
            <Tag size={14} weight="duotone" className="text-success" aria-hidden="true" />
          </div>
          <span className="text-sm font-bold text-foreground">{t('products.discounted')}</span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted border border-border/60 text-[10px] font-bold text-muted-foreground tabular-nums">
            <Sparkle size={10} weight="fill" aria-hidden="true" />
            {saleProducts.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
            className="w-7 h-7 rounded-lg flex items-center justify-center border border-border/50 text-muted-foreground transition-all duration-150 cursor-pointer hover:text-success hover:border-success/30 hover:bg-success/5 disabled:opacity-30 disabled:cursor-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success/50"
          >
            <CaretLeft size={12} weight="bold" aria-hidden="true" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            aria-label="Scroll right"
            className="w-7 h-7 rounded-lg flex items-center justify-center border border-border/50 text-muted-foreground transition-all duration-150 cursor-pointer hover:text-success hover:border-success/30 hover:bg-success/5 disabled:opacity-30 disabled:cursor-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success/50"
          >
            <CaretRight size={12} weight="bold" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Scrollable cards */}
      <div
        ref={cardsRef}
        className="p-4 overflow-x-auto scrollbar-none"
      >
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <div className="flex gap-3 items-stretch">
              {saleProducts.map((product) => (
                <div key={product.id} className="w-50 sm:w-56 shrink-0 flex">
                  <ProductMiniCard
                    product={toMiniCardProduct(product, localized)}
                    outOfStockLabel={t('products.outOfStock')}
                    priceOnRequestLabel={t('products.priceOnRequest')}
                    categoryLabels={categoryLabels}
                    saleColor="success"
                  />
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
}
