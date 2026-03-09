'use client';

import Link from 'next/link';
import { SafeImage } from '@/components/common/SafeImage';
import { SecurityCamera, Wrench } from '@phosphor-icons/react/dist/ssr';
import { cn } from '@/lib/utils';
import { getProductImageUrl } from '../hooks/useCatalog';
import { useLocale } from '@/lib/i18n';

import type { LocalizedString } from '../types/catalog.types';

interface ProductCardProduct {
  id: string;
  slug: string;
  name: string | LocalizedString;
  categories: string[];
  price: number;
  originalPrice?: number;
  discount?: number | null;
  images: string[];
}

interface ProductCardProps {
  product: ProductCardProduct;
}

export function ProductCard({ product }: ProductCardProps): React.ReactElement {
  const { t, localized } = useLocale();
  const name = typeof product.name === 'string' ? product.name : localized(product.name);
  const hasImage = product.images.length > 0;
  const isService = product.categories.includes('services');
  const categoryLabel = t(`category.${product.categories[0]}` as keyof typeof import('@/lib/i18n/locales/ka.json')) ?? product.categories[0];
  const imgSrc = hasImage ? getProductImageUrl(product.images[0]) : '';

  return (
    <article className="group relative flex flex-col rounded-xl border border-border/50 bg-card overflow-hidden transition-all duration-300 hover:border-border/80 hover:-translate-y-0.5">

      {/* Image */}
      <Link
        href={`/catalog/${product.slug}`}
        className="block relative aspect-4/3 overflow-hidden bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
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
            {isService ? (
              <Wrench size={36} weight="duotone" className="text-primary/40" aria-hidden="true" />
            ) : (
              <SecurityCamera size={36} weight="duotone" className="text-border/60" aria-hidden="true" />
            )}
            <span className="text-[9px] font-mono text-muted-foreground/40 tracking-[0.25em]">
              {isService ? t('catalog.service') : t('catalog.noSignal')}
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
        {product.discount != null && product.discount > 0 && (
          <div className="absolute bottom-3 left-3">
            <span className="inline-flex items-center px-3 py-1 rounded-lg bg-success text-white text-sm font-bold tabular-nums">
              -{product.discount}%
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-3">

        <Link href={`/catalog/${product.slug}`} className="focus-visible:outline-none">
          <h3 className="font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-200 text-base">
            {name}
          </h3>
        </Link>

        {/* Price + CTA */}
        <div className="mt-auto flex items-center justify-between gap-3">
          {isService ? (
            <span className="text-sm text-muted-foreground italic">
              {t('catalog.priceOnRequest')}
            </span>
          ) : (
            <div className="flex flex-col leading-none">
              {product.originalPrice ? (
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
            className="flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg bg-primary text-primary-foreground font-semibold text-xs whitespace-nowrap transition-all duration-200 hover:brightness-110 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            {t('catalog.learnMore')}
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
            </svg>
          </Link>
        </div>

      </div>
    </article>
  );
}
