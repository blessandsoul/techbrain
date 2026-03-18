'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Phone, SecurityCamera, CaretLeft, CaretRight, Wrench, ShieldCheck, Truck } from '@phosphor-icons/react';
import { formatPhone, stripHtml } from '@/lib/utils/format';
import { CategoryNavBar } from '@/components/common/CategoryNavBar';
import { SafeImage } from '@/components/common/SafeImage';
import { useFeaturedProducts, useCategoryCounts, getProductImageUrl } from '@/features/catalog/hooks/useCatalog';
import { usePublicSiteSettings } from '@/hooks/useSiteSettings';
import { useLocale } from '@/lib/i18n';

import type { IProduct } from '@/features/catalog/types/catalog.types';

// ── Carousel ──────────────────────────────────────────────────────────────────

function CarouselD({ products, currentIndex, dir, onPrev, onNext, productName }: {
  products: IProduct[]; currentIndex: number; dir: number;
  onPrev: () => void; onNext: () => void; productName: string;
}) {
  const product = products[currentIndex];
  const name = productName;
  const imageSrc = product.images.length > 0 ? getProductImageUrl(product.images[0]) : null;

  const overlayBtnClass = "absolute top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 flex items-center justify-center text-foreground active:scale-95 transition-transform lg:hidden";

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-2xl lg:rounded-3xl">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={product.id} initial={{ opacity: 0, x: dir > 0 ? 50 : -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir > 0 ? -50 : 50 }} transition={{ duration: 0.35, ease: 'easeOut' }}>
          <div className="relative overflow-hidden border border-border/50 bg-card group rounded-2xl lg:rounded-3xl">
            <div className="aspect-[4/3] lg:aspect-square bg-white relative overflow-hidden flex items-center justify-center">
              {imageSrc ? (
                <SafeImage src={imageSrc} alt={name} fill className="object-contain object-center motion-safe:group-hover:scale-105 transition-transform duration-700" sizes="(max-width: 768px) 90vw, (max-width: 1024px) 50vw, 600px" priority={currentIndex === 0} />
              ) : (
                <SecurityCamera size={64} weight="duotone" className="text-border/30" />
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
      </div>

      {/* Mobile overlay nav arrows on the image */}
      {products.length > 1 && (
        <>
          <button onClick={(e) => { e.preventDefault(); onPrev(); }} className={`${overlayBtnClass} left-2`} aria-label="Previous">
            <CaretLeft size={16} weight="bold" />
          </button>
          <button onClick={(e) => { e.preventDefault(); onNext(); }} className={`${overlayBtnClass} right-2`} aria-label="Next">
            <CaretRight size={16} weight="bold" />
          </button>
        </>
      )}
    </div>
  );
}

// ── Spec Tags ─────────────────────────────────────────────────────────────────

function ProductSpecTagsD({ product, specKeyLocalized }: { product: IProduct; specKeyLocalized: (key: IProduct['specs'][number]['key']) => string }) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      {product.specs.slice(0, 6).map((spec, i) => (
        <motion.span key={`${product.id}-${i}`} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.15, delay: i * 0.02, ease: 'easeOut' }} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border bg-background/50 backdrop-blur-sm border-border/50">
          <span className="text-muted-foreground/60 text-[11px]">{specKeyLocalized(spec.key)}:</span>
          <span className="font-semibold">{spec.value}</span>
        </motion.span>
      ))}
    </AnimatePresence>
  );
}

// ── Dot Indicators ────────────────────────────────────────────────────────────

function DotIndicators({ count, current, onDotClick }: { count: number; current: number; onDotClick: (i: number) => void }) {
  if (count <= 1) return null;

  const totalDots = 9;
  const prevRef = useRef(current);
  const windowStartRef = useRef(((current - 4) % count + count) % count);
  const activePosRef = useRef(4);

  if (prevRef.current !== current) {
    const prev = prevRef.current;
    prevRef.current = current;

    const fwd = ((current - prev) % count + count) % count;
    const bwd = ((prev - current) % count + count) % count;

    if (fwd <= bwd) {
      activePosRef.current += fwd;
    } else {
      activePosRef.current -= bwd;
    }

    if (activePosRef.current > 6) {
      const shift = activePosRef.current - 5;
      windowStartRef.current = (windowStartRef.current + shift) % count;
      activePosRef.current = 5;
    } else if (activePosRef.current < 2) {
      const shift = 3 - activePosRef.current;
      windowStartRef.current = ((windowStartRef.current - shift) % count + count) % count;
      activePosRef.current = 3;
    }
  }

  return (
    <div className="flex items-center justify-center gap-1.5">
      {Array.from({ length: totalDots }).map((_, i) => {
        const actualIndex = (windowStartRef.current + i) % count;
        const isActive = i === activePosRef.current;
        const isEdge = i === 0 || i === totalDots - 1;

        let className: string;
        if (isActive) {
          className = 'bg-primary w-5 h-2';
        } else if (isEdge) {
          className = 'bg-muted-foreground/20 w-1.5 h-1.5';
        } else {
          className = 'bg-muted-foreground/30 hover:bg-muted-foreground/50 w-2 h-2';
        }

        return (
          <button
            key={i}
            onClick={() => onDotClick(actualIndex)}
            className={`rounded-full transition-all duration-300 cursor-pointer ${className}`}
            aria-label={`Go to slide ${actualIndex + 1}`}
          />
        );
      })}
    </div>
  );
}

// ── Main HeroSection ──────────────────────────────────────────────────────────

function HeroSkeleton(): React.ReactElement {
  return (
    <section className="hero-bg relative -mt-17 flex flex-col overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10 pt-25 pb-3 md:pt-32 lg:pt-28 lg:pb-3">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center">
          {/* Text skeleton */}
          <div className="flex flex-col gap-4 order-2 lg:order-1">
            <div className="h-8 w-3/4 bg-muted/60 rounded-lg animate-pulse" />
            <div className="h-5 w-full bg-muted/40 rounded-lg animate-pulse" />
            <div className="h-5 w-2/3 bg-muted/40 rounded-lg animate-pulse" />
            <div className="flex gap-2 pt-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-8 w-24 bg-muted/30 rounded-full animate-pulse" />
              ))}
            </div>
            <div className="flex gap-3 pt-4">
              <div className="h-12 w-40 bg-primary/20 rounded-xl animate-pulse" />
              <div className="h-12 w-40 bg-muted/30 rounded-xl animate-pulse" />
            </div>
          </div>
          {/* Image skeleton */}
          <div className="order-1 lg:order-2">
            <div className="aspect-[4/3] lg:aspect-square bg-muted/40 rounded-2xl lg:rounded-3xl animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function HeroSection(): React.ReactElement {
  const { data: products = [], isLoading } = useFeaturedProducts();
  const { data: categoryCounts } = useCategoryCounts();
  const { contact, stats } = usePublicSiteSettings();
  const { t, localized } = useLocale();
  const phone = contact.whatsapp || contact.phone;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const go = useCallback((next: number) => { setDir(next > currentIndex ? 1 : -1); setCurrentIndex(next); }, [currentIndex]);
  const prev = useCallback(() => go((currentIndex - 1 + products.length) % products.length), [go, currentIndex, products.length]);
  const next = useCallback(() => go((currentIndex + 1) % products.length), [go, currentIndex, products.length]);

  // Auto-play: 5s interval, pause on hover
  useEffect(() => {
    if (isHovered || products.length <= 1) return;
    const interval = setInterval(() => {
      go((currentIndex + 1) % products.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isHovered, currentIndex, go, products.length]);

  if (isLoading) return <HeroSkeleton />;
  if (products.length === 0) return <></>;

  const currentProduct = products[currentIndex];
  const navBtnClass = "w-10 h-10 rounded-xl border border-border/60 bg-card hover:bg-accent hover:border-primary/40 flex items-center justify-center text-foreground motion-safe:transition-all duration-200 motion-safe:hover:scale-105 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50";

  return (
    <section className="hero-bg relative -mt-17 flex flex-col overflow-hidden">

      {/* Animated background blobs */}
      <div className="absolute inset-0 noise-overlay pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/15 rounded-full blur-3xl motion-safe:animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl motion-safe:animate-pulse motion-safe:[animation-delay:1000ms]" />
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-linear-to-t from-background to-transparent pointer-events-none" aria-hidden="true" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10 pt-25 pb-3 md:pt-32 lg:pt-28 lg:pb-3">
        <div
          className="flex items-center gap-4 lg:gap-6"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Desktop prev button */}
          {products.length > 1 && (
            <button onClick={(e) => { e.preventDefault(); prev(); }} className={`${navBtnClass} shrink-0 hidden lg:flex`} aria-label="Previous">
              <CaretLeft size={18} weight="bold" />
            </button>
          )}

          {/* Main content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 lg:items-stretch items-center flex-1 min-w-0">

            {/* Image column — first on mobile, second on desktop */}
            <div className="relative order-1 lg:order-2 min-w-0 animate-in fade-in slide-in-from-right-4 duration-700 delay-300">
              <div className="absolute inset-0 bg-linear-to-r from-primary/10 to-primary/5 lg:from-primary/15 lg:to-primary/10 rounded-3xl blur-2xl" aria-hidden="true" />
              <CarouselD products={products} currentIndex={currentIndex} dir={dir} onPrev={prev} onNext={next} productName={localized(currentProduct.name)} />
              {/* Mobile dots under image */}
              {products.length > 1 && (
                <div className="flex items-center justify-center pt-3 lg:hidden">
                  <DotIndicators count={products.length} current={currentIndex} onDotClick={go} />
                </div>
              )}
            </div>

            {/* Text column — second on mobile, first on desktop */}
            <div className="flex flex-col gap-4 order-2 lg:order-1 min-w-0">
              {/* Title + description + specs */}
              <div className="space-y-4">
                {/* Product title */}
                <div className="overflow-hidden">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.h1
                    key={currentProduct.id + '-title'}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="text-xl sm:text-2xl lg:text-[34px] xl:text-[42px] font-bold tracking-tight leading-tight text-hero-shimmer line-clamp-2 uppercase"
                  >
                    {localized(currentProduct.name)}
                  </motion.h1>
                </AnimatePresence>
                </div>

                {/* Description + Spec tags */}
                <div className="space-y-4">
                  <div className="overflow-hidden">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.p
                      key={currentProduct.id + '-desc'}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      className="text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed line-clamp-3"
                    >
                      {stripHtml(localized(currentProduct.description) || '') || t('hero.subtitle')}
                    </motion.p>
                  </AnimatePresence>
                  </div>

                  {/* Spec tags */}
                  <div className="overflow-hidden">
                  <motion.div className="flex flex-wrap items-center gap-2 min-h-10 content-start" layout>
                    <ProductSpecTagsD product={currentProduct} specKeyLocalized={localized} />
                  </motion.div>
                  </div>
                </div>
              </div>

              {/* CTA buttons + dots */}
              <div>
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Link href={`/catalog/${currentProduct.slug}`} className="inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:px-8 sm:py-4 lg:px-5 lg:py-3 xl:px-8 xl:py-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm sm:text-base lg:text-sm xl:text-base motion-safe:transition-all duration-200 motion-safe:hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
                    {t('hero.cta')}<ArrowRight size={18} weight="bold" />
                  </Link>
                  <a href={`https://wa.me/995${phone}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:px-8 sm:py-4 lg:px-5 lg:py-3 xl:px-8 xl:py-4 rounded-xl border-2 border-border hover:border-primary/40 bg-background/50 backdrop-blur-sm font-bold text-sm sm:text-base lg:text-sm xl:text-base motion-safe:transition-all duration-200 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30">
                    <Phone size={18} weight="fill" /><span className="font-noto">{formatPhone(phone)}</span>
                  </a>
                </div>

                {/* Desktop dots */}
                {products.length > 1 && (
                  <div className="hidden lg:flex items-center gap-3 pt-6">
                    <DotIndicators count={products.length} current={currentIndex} onDotClick={go} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Desktop next button */}
          {products.length > 1 && (
            <button onClick={(e) => { e.preventDefault(); next(); }} className={`${navBtnClass} shrink-0 hidden lg:flex`} aria-label="Next">
              <CaretRight size={18} weight="bold" />
            </button>
          )}
        </div>
      </div>

      {/* Why Us — service cards */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10 pt-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div className="flex items-center gap-3 p-4 rounded-xl bg-background/80 backdrop-blur-sm border border-border/50 transition-all duration-300 hover:-translate-y-0.5">
            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Wrench size={20} weight="duotone" className="text-primary" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">{t('hero.install')}</h3>
              <p className="text-xs text-muted-foreground">{t('hero.installDesc')}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/15 transition-all duration-300 hover:-translate-y-0.5">
            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <ShieldCheck size={20} weight="duotone" className="text-primary" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">{t('hero.guarantee')}</h3>
              <p className="text-xs text-muted-foreground">{t('hero.guaranteeDesc')}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-background/80 backdrop-blur-sm border border-border/50 transition-all duration-300 hover:-translate-y-0.5">
            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Truck size={20} weight="duotone" className="text-primary" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">{t('hero.delivery')}</h3>
              <p className="text-xs text-muted-foreground">{t('hero.deliveryDesc')}</p>
            </div>
          </div>

        </div>
      </div>

      {/* Category Nav Bar */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10 pt-10 pb-0">
        <CategoryNavBar
          counts={categoryCounts}
          badge={t('hero.badge', { cameras: stats.camerasInstalled, warranty: stats.warrantyYears })}
          title={t('hero.title')}
          subtitle={t('hero.subtitle')}
          categoryLabels={{
            cameras: t('category.cameras'),
            'nvr-kits': t('category.nvr-kits'),
            accessories: t('category.accessories'),
            storage: t('category.storage'),
            services: t('category.services'),
          }}
        />
      </div>

      {/* Bottom spacer */}
      <div className="h-10" />
    </section>
  );
}
