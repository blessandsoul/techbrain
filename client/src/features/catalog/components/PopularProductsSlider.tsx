'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { SafeImage } from '@/components/common/SafeImage';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useLocale } from '@/lib/i18n';
import { getProductImageUrl } from '../hooks/useCatalog';

import type { IProduct } from '../types/catalog.types';

interface PopularProductsSliderProps {
  products: IProduct[];
  title: string;
  subtitle: string;
}

export function PopularProductsSlider({ products, title, subtitle }: PopularProductsSliderProps): React.ReactElement | null {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback((): void => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return (): void => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll]);

  const scroll = useCallback((direction: 'left' | 'right'): void => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector<HTMLElement>('[data-slider-card]')?.offsetWidth ?? 280;
    const gap = 24;
    const distance = (cardWidth + gap) * 2;
    el.scrollBy({ left: direction === 'left' ? -distance : distance, behavior: 'smooth' });
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="mt-16 mb-4" aria-labelledby="popular-heading">
      {/* Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" aria-hidden="true" />
            {subtitle}
          </span>
          <h2 id="popular-heading" className="text-2xl font-bold text-foreground">
            {title}
          </h2>
        </div>

        {/* Navigation arrows */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            type="button"
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
            className={cn(
              'w-10 h-10 rounded-xl border border-border/60 bg-card flex items-center justify-center transition-all duration-200 cursor-pointer',
              'hover:bg-muted hover:border-border active:scale-[0.95]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
              'disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-card'
            )}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            aria-label="Scroll right"
            className={cn(
              'w-10 h-10 rounded-xl border border-border/60 bg-card flex items-center justify-center transition-all duration-200 cursor-pointer',
              'hover:bg-muted hover:border-border active:scale-[0.95]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
              'disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-card'
            )}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Slider track */}
      <div className="relative">
        {/* Left fade */}
        <div
          className={cn(
            'absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none bg-linear-to-r from-background to-transparent transition-opacity duration-300',
            canScrollLeft ? 'opacity-100' : 'opacity-0'
          )}
          aria-hidden="true"
        />

        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scroll-smooth pb-2 -mb-2 scrollbar-none"
          role="list"
        >
          {products.map((product) => (
            <SliderCard key={product.id} product={product} />
          ))}
        </div>

        {/* Right fade */}
        <div
          className={cn(
            'absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none bg-linear-to-l from-background to-transparent transition-opacity duration-300',
            canScrollRight ? 'opacity-100' : 'opacity-0'
          )}
          aria-hidden="true"
        />
      </div>
    </section>
  );
}

/* ── Compact slider card ── */

function SliderCard({ product }: { product: IProduct }): React.ReactElement {
  const { t, localized } = useLocale();
  const name = localized(product.name);
  const hasImage = product.images.length > 0;
  const imgSrc = hasImage ? getProductImageUrl(product.images[0]) : '';
  const isService = product.categories.includes('services');
  const hasDiscount = product.originalPrice !== undefined && product.originalPrice > product.price;

  return (
    <Link
      href={`/catalog/${product.slug}`}
      data-slider-card
      role="listitem"
      className="group shrink-0 w-60 sm:w-65 rounded-xl border border-border/50 bg-card overflow-hidden transition-all duration-300 hover:border-border/80 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
    >
      {/* Image */}
      <div className="relative aspect-4/3 bg-white overflow-hidden">
        {hasImage ? (
          <SafeImage
            src={imgSrc}
            alt={name}
            className="object-contain transition-transform duration-500 group-hover:scale-[1.04]"
            sizes="260px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 256 256" className="text-border/60" aria-hidden="true">
              <path d="M208,56H180.28L166.65,35.56A8,8,0,0,0,160,32H96a8,8,0,0,0-6.65,3.56L75.72,56H48A24,24,0,0,0,24,80V192a24,24,0,0,0,24,24H208a24,24,0,0,0,24-24V80A24,24,0,0,0,208,56Zm8,136a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V80a8,8,0,0,1,8-8H80a8,8,0,0,0,6.66-3.56L100.28,48h55.44l13.62,20.44A8,8,0,0,0,176,72h32a8,8,0,0,1,8,8ZM128,88a44,44,0,1,0,44,44A44.05,44.05,0,0,0,128,88Zm0,72a28,28,0,1,1,28-28A28,28,0,0,1,128,160Z" />
            </svg>
          </div>
        )}

        {/* Category pill */}
        <div className="absolute top-2.5 left-2.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-background/90 backdrop-blur-sm border border-border/60 text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            <span className="w-1 h-1 rounded-full bg-primary" aria-hidden="true" />
            {t(`category.${product.categories[0]}` as keyof typeof import('@/lib/i18n/locales/ka.json')) ?? product.categories[0]}
          </span>
        </div>

        {/* Discount badge */}
        {hasDiscount && (
          <div className="absolute bottom-2.5 left-2.5">
            <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-success text-white text-xs font-bold tabular-nums">
              -{Math.round((1 - product.price / product.originalPrice!) * 100)}%
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-200 mb-2">
          {name}
        </h3>

        {isService ? (
          <span className="text-sm text-muted-foreground italic">{t('products.byOrder')}</span>
        ) : (
          <div className="flex items-baseline gap-2">
            {hasDiscount && (
              <span className="text-xs text-destructive/60 line-through tabular-nums">
                {product.originalPrice}₾
              </span>
            )}
            <span className={cn('font-bold tabular-nums text-lg', hasDiscount ? 'text-success' : 'text-foreground')}>
              {product.price}<span className="text-sm ml-0.5">₾</span>
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
