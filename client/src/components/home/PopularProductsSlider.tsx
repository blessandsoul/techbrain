'use client';

import Link from 'next/link';
import type { ReactElement } from 'react';
import { SafeImage } from '@/components/common/SafeImage';
import { cn } from '@/lib/utils';
import { useFeaturedProducts, getProductImageUrl } from '@/features/catalog/hooks/useCatalog';
import { useLocale } from '@/lib/i18n';

import type { IProduct } from '@/features/catalog/types/catalog.types';

interface FlatProduct {
  id: string;
  slug: string;
  categories: string[];
  price: number;
  originalPrice?: number;
  images: string[];
  name: string;
}

function toFlatProduct(product: IProduct, localized: (field: { ka: string; ru: string; en: string } | string) => string): FlatProduct {
  return {
    id: product.id,
    slug: product.slug,
    categories: product.categories,
    price: product.price,
    originalPrice: product.originalPrice,
    images: product.images.map(getProductImageUrl),
    name: localized(product.name),
  };
}

export function PopularProductsSlider(): ReactElement | null {
  const { data: featuredProducts, isLoading } = useFeaturedProducts();
  const { t, localized } = useLocale();
  const products = featuredProducts?.map((p) => toFlatProduct(p, localized)) ?? [];

  const categoryLabels: Record<string, string> = {
    cameras: t('category.cameras'),
    'nvr-kits': t('category.nvr-kits'),
    storage: t('category.storage'),
    services: t('category.services'),
    accessories: t('category.accessories'),
  };

  if (!isLoading && products.length === 0) return null;

  if (isLoading) {
    return (
      <section className="py-10 lg:py-14 bg-background" aria-labelledby="featured-heading">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="h-3 w-48 rounded bg-muted animate-pulse mb-3" />
              <div className="h-7 w-64 rounded bg-muted animate-pulse" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border/50 bg-card overflow-hidden">
                <div className="aspect-4/3 bg-muted animate-pulse" />
                <div className="p-5 space-y-4">
                  <div className="h-5 w-3/4 rounded bg-muted animate-pulse" />
                  <div className="flex items-center justify-between">
                    <div className="h-8 w-20 rounded bg-muted animate-pulse" />
                    <div className="h-11 w-28 rounded-xl bg-muted animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 lg:py-14 bg-background" aria-labelledby="featured-heading">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">

        {/* Section header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" aria-hidden="true" />
              {t('products.bestSellers')}
            </span>
            <h2 id="featured-heading" className="text-2xl md:text-3xl font-bold text-foreground">
              {t('products.popular')}
            </h2>
          </div>
          <Link
            href="/catalog"
            className="hidden md:flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-lg px-2 py-1 mb-0.5"
          >
            {t('products.viewProducts')}
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} categoryLabels={categoryLabels} byOrderLabel={t('products.byOrder')} learnMoreLabel={t('products.learnMore')} />
          ))}
        </div>

      </div>
    </section>
  );
}

/* -- Product card (matches reference ProductCard design) -- */

function ProductCard({ product, categoryLabels, byOrderLabel, learnMoreLabel }: { product: FlatProduct; categoryLabels: Record<string, string>; byOrderLabel: string; learnMoreLabel: string }): ReactElement {
  const name = product.name;
  const hasImage = product.images.length > 0;
  const isService = product.categories.includes('services');
  const categoryLabel = categoryLabels[product.categories[0]] ?? product.categories[0];
  const imgSrc = hasImage
    ? (product.images[0].startsWith('http') ? product.images[0] : `/images/products/${product.images[0]}`)
    : '';
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;

  return (
    <article className="group relative flex flex-col rounded-xl border border-border/50 bg-card overflow-hidden transition-all duration-300 hover:border-border/80 hover:-translate-y-0.5">

      {/* Image */}
      <Link
        href={`/catalog/${product.slug}`}
        className="block relative aspect-4/3 overflow-hidden bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        aria-label={name}
      >
        {hasImage ? (
          <>
            <SafeImage
              src={imgSrc}
              alt={name}
              className="object-contain transition-transform duration-500 group-hover:scale-[1.03]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            <div className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-card/80 to-transparent pointer-events-none" aria-hidden="true" />
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" viewBox="0 0 256 256" className="text-border/60" aria-hidden="true">
              <path d="M208,56H180.28L166.65,35.56A8,8,0,0,0,160,32H96a8,8,0,0,0-6.65,3.56L75.72,56H48A24,24,0,0,0,24,80V192a24,24,0,0,0,24,24H208a24,24,0,0,0,24-24V80A24,24,0,0,0,208,56Zm8,136a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V80a8,8,0,0,1,8-8H80a8,8,0,0,0,6.66-3.56L100.28,48h55.44l13.62,20.44A8,8,0,0,0,176,72h32a8,8,0,0,1,8,8ZM128,88a44,44,0,1,0,44,44A44.05,44.05,0,0,0,128,88Zm0,72a28,28,0,1,1,28-28A28,28,0,0,1,128,160Z" />
            </svg>
            <span className="text-[9px] font-mono text-muted-foreground/40 tracking-[0.25em] uppercase">
              NO SIGNAL
            </span>
          </div>
        )}

        {/* Category badge */}
        <div className={cn('absolute top-3 left-3', !hasImage && 'hidden')}>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-background/90 backdrop-blur-sm border border-border/60 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            <span className="w-1 h-1 rounded-full bg-primary" aria-hidden="true" />
            {categoryLabel}
          </span>
        </div>

        {/* Discount badge */}
        {hasDiscount && (
          <div className="absolute bottom-3 left-3">
            <span className="inline-flex items-center px-3 py-1 rounded-lg bg-success text-white text-sm font-bold tabular-nums">
              -{Math.round((1 - product.price / product.originalPrice!) * 100)}%
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5 gap-4">

        <Link href={`/catalog/${product.slug}`} className="focus-visible:outline-none">
          <h3 className="font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-200 text-base">
            {name}
          </h3>
        </Link>

        {/* Price + CTA */}
        <div className="mt-auto flex items-center justify-between gap-3">
          {isService ? (
            <span className="text-base text-muted-foreground italic">
              {byOrderLabel}
            </span>
          ) : (
            <div className="flex flex-col leading-none">
              {hasDiscount ? (
                <>
                  <span className="text-sm text-destructive/60 line-through tabular-nums mb-0.5">
                    {product.originalPrice}₾
                  </span>
                  <span className="font-bold text-2xl text-success tabular-nums">
                    {product.price}<span className="ml-1 text-lg">₾</span>
                  </span>
                </>
              ) : (
                <span className="font-bold text-2xl text-foreground tabular-nums">
                  {product.price}<span className="text-primary ml-1 text-lg">₾</span>
                </span>
              )}
            </div>
          )}

          <Link
            href={`/catalog/${product.slug}`}
            className="flex items-center justify-center gap-2 h-11 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm whitespace-nowrap transition-all duration-200 hover:brightness-110 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            {learnMoreLabel}
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
            </svg>
          </Link>
        </div>

      </div>
    </article>
  );
}
