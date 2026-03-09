'use client';

import { Suspense, useState, useRef, useEffect, useCallback } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import { useProduct, useRelatedProducts, useFeaturedProducts } from '@/features/catalog/hooks/useCatalog';
import { ProductGallery } from '@/features/catalog/components/ProductGallery';
import { ProductCTA } from '@/features/catalog/components/ProductCTA';
import { BoughtTogether } from '@/features/catalog/components/BoughtTogether';
import { PopularProductsSlider } from '@/features/catalog/components/PopularProductsSlider';
import { useLocale } from '@/lib/i18n';

import DOMPurify from 'isomorphic-dompurify';
import type { IProduct, IProductSpec, LocalizedString } from '@/features/catalog/types/catalog.types';

function ProductDetailSkeleton(): React.ReactElement {
  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl py-12 animate-pulse">
      <div className="h-4 w-24 bg-muted rounded mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="aspect-square rounded-2xl bg-muted" />
        <div className="space-y-6">
          <div className="h-3 w-20 bg-muted rounded" />
          <div className="h-8 w-3/4 bg-muted rounded" />
          <div className="h-20 bg-muted rounded" />
          <div className="h-16 bg-muted rounded-xl" />
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-10 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const SPECS_COLLAPSED_COUNT = 15;

function SpecsTable({ specs }: { specs: IProductSpec[] }): React.ReactElement {
  const { t, localized } = useLocale();
  const [expanded, setExpanded] = useState(false);

  // Group specs by key so multi-value specs show as one row
  const grouped: Array<{ key: LocalizedString; values: string[] }> = [];
  const keyMap = new Map<string, number>();
  for (const spec of specs) {
    const localizedKey = localized(spec.key);
    if (keyMap.has(localizedKey)) {
      grouped[keyMap.get(localizedKey)!].values.push(spec.value);
    } else {
      keyMap.set(localizedKey, grouped.length);
      grouped.push({ key: spec.key, values: [spec.value] });
    }
  }

  const needsTruncation = grouped.length > SPECS_COLLAPSED_COUNT;
  const visibleSpecs = expanded || !needsTruncation ? grouped : grouped.slice(0, SPECS_COLLAPSED_COUNT);

  const handleToggle = useCallback((): void => {
    setExpanded((prev) => !prev);
  }, []);

  return (
    <div>
      <h2 className="font-semibold text-foreground mb-4">{t('catalog.specification')}</h2>
      <div className="rounded-xl border border-border overflow-hidden">
        {visibleSpecs.map((group, i) => (
          <div
            key={i}
            className={`flex items-center justify-between px-4 py-3 ${
              i % 2 === 0 ? 'bg-muted' : 'bg-muted/50'
            }`}
          >
            <span className="text-sm text-muted-foreground">{localized(group.key)}</span>
            <span className="text-sm font-medium text-foreground tabular-nums">{group.values.join(', ')}</span>
          </div>
        ))}
      </div>
      {needsTruncation && (
        <button
          type="button"
          onClick={handleToggle}
          className="mt-3 text-sm font-medium text-primary active:opacity-70 md:hover:underline transition-colors min-h-11"
        >
          {expanded ? t('catalog.readLess') : t('catalog.showMore', { count: String(grouped.length - SPECS_COLLAPSED_COUNT) })}
        </button>
      )}
    </div>
  );
}

const DESCRIPTION_COLLAPSED_HEIGHT = 160;

function ExpandableDescription({ html }: { html: string }): React.ReactElement {
  const { t } = useLocale();
  const [expanded, setExpanded] = useState(false);
  const [needsTruncation, setNeedsTruncation] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      setNeedsTruncation(contentRef.current.scrollHeight > DESCRIPTION_COLLAPSED_HEIGHT);
    }
  }, [html]);

  const handleToggle = useCallback((): void => {
    setExpanded((prev) => !prev);
  }, []);

  // html is already sanitized with DOMPurify by the caller
  return (
    <div className="relative">
      <div
        ref={contentRef}
        className="prose prose-sm max-w-none text-muted-foreground leading-relaxed prose-headings:text-foreground prose-a:text-primary prose-a:underline overflow-hidden transition-[max-height] duration-300 ease-out"
        style={{ maxHeight: expanded || !needsTruncation ? contentRef.current?.scrollHeight ?? 'none' : DESCRIPTION_COLLAPSED_HEIGHT }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {needsTruncation && !expanded && (
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      )}
      {needsTruncation && (
        <button
          type="button"
          onClick={handleToggle}
          className="mt-2 text-sm font-medium text-primary active:opacity-70 md:hover:underline transition-colors min-h-11"
        >
          {expanded ? t('catalog.readLess') : t('catalog.readMore')}
        </button>
      )}
    </div>
  );
}

function ProductDetailContent(): React.ReactElement {
  const { t, localized } = useLocale();
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const { data: product, isLoading, isError } = useProduct(slug);
  const { data: relatedProducts } = useRelatedProducts(slug, !!product);
  const { data: featuredProducts } = useFeaturedProducts();

  if (isLoading) return <ProductDetailSkeleton />;
  if (isError || !product) return notFound();

  const isService = product.categories.includes('services');
  const popularProducts = (featuredProducts ?? []).filter((p: IProduct) => p.id !== product.id);
  const categoryLabel = t(`category.${product.categories[0]}` as keyof typeof import('@/lib/i18n/locales/ka.json')) ?? product.categories[0];

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl py-12">
      {/* Back link */}
      <Link
        href="/catalog"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        {t('catalog.back')}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left column: gallery + bought together */}
        <div className="flex flex-col gap-6">
          <ProductGallery images={product.images} productName={localized(product.name)} />

          {/* Bought together block */}
          {relatedProducts && relatedProducts.length > 0 && (
            <BoughtTogether
              mainProduct={product}
              relatedProducts={relatedProducts}
            />
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-6">
          <div>
            <span className="text-xs font-medium text-primary uppercase tracking-wide">
              {categoryLabel}
            </span>
            <h1 className="text-3xl font-bold text-foreground mt-2 text-balance">
              {localized(product.name)}
            </h1>
          </div>

          {localized(product.description) && (
            <ExpandableDescription html={DOMPurify.sanitize(localized(product.description))} />
          )}

          {/* Price + CTA */}
          <div className="flex flex-col gap-4 p-6 rounded-xl bg-muted border border-border">
            {isService ? (
              <span className="text-muted-foreground">{t('catalog.priceNegotiable')}</span>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  {product.originalPrice && product.discount != null && product.discount > 0 ? (
                    <>
                      <span className="text-lg text-destructive/60 line-through tabular-nums">{product.originalPrice} ₾</span>
                      <span className="text-3xl font-bold text-success tabular-nums">{product.price} ₾</span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-success text-white text-sm font-bold tabular-nums">
                        -{product.discount}%
                      </span>
                    </>
                  ) : (
                    <span className="text-3xl font-bold text-foreground tabular-nums">{product.price} ₾</span>
                  )}
                </div>
                <ProductCTA product={product} />
              </>
            )}
          </div>

          {/* Specs table */}
          {product.specs.length > 0 && <SpecsTable specs={product.specs} />}
        </div>
      </div>

      {/* Popular products slider */}
      {popularProducts.length > 0 && (
        <PopularProductsSlider
          products={popularProducts}
          title={t('products.popular')}
          subtitle={t('catalog.recommended')}
        />
      )}
    </div>
  );
}

export default function ProductDetailPage(): React.ReactElement {
  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      <ProductDetailContent />
    </Suspense>
  );
}
