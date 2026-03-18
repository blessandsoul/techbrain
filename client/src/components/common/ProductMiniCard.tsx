'use client';

import Link from 'next/link';
import { SafeImage } from '@/components/common/SafeImage';
import {
  SecurityCamera,
  Package,
  ArrowRight,
  Camera,
  HardDrive,
  Wrench,
  Cpu,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface ProductSpec {
  key: string;
  value: string;
}

interface Product {
  id: string;
  slug: string;
  categories: string[];
  price: number;
  originalPrice?: number;
  images: string[];
  name: string;
  specs: ProductSpec[];
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  cameras:     <Camera    size={11} weight="duotone" aria-hidden="true" />,
  'nvr-kits':  <Cpu       size={11} weight="duotone" aria-hidden="true" />,
  storage:     <HardDrive size={11} weight="duotone" aria-hidden="true" />,
  accessories: <Package   size={11} weight="duotone" aria-hidden="true" />,
  services:    <Wrench    size={11} weight="duotone" aria-hidden="true" />,
};

interface ProductMiniCardProps {
  product: Product;
  inStockLabel: string;
  priceOnRequestLabel: string;
  categoryLabels: Record<string, string>;
  saleColor?: 'destructive' | 'success';
}

export function ProductMiniCard({ product, inStockLabel, priceOnRequestLabel, categoryLabels, saleColor = 'destructive' }: ProductMiniCardProps): React.ReactElement {
  const name = product.name;
  const hasImage = product.images.length > 0;
  const isService = product.categories.includes('services');
  const imageSrc = hasImage
    ? product.images[0].startsWith('http')
      ? product.images[0]
      : `/images/products/${product.images[0]}`
    : null;
  const primaryCategory = product.categories[0];
  const categoryIcon = CATEGORY_ICONS[primaryCategory] ?? <Package size={11} weight="duotone" aria-hidden="true" />;
  const categoryLabel = categoryLabels[primaryCategory] ?? primaryCategory;

  return (
    <Link
      href={`/catalog/${product.slug}`}
      className={cn(
        'group relative rounded-xl border flex flex-col overflow-hidden min-w-0 h-full w-full',
        'transition-all duration-300 ease-out cursor-pointer',
        'border-border bg-card',
        'hover:border-primary/30 hover:-translate-y-0.5',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
      )}
      aria-label={name}
    >
      {/* Image */}
      <div className="relative aspect-16/10 bg-white overflow-hidden shrink-0">
        {imageSrc ? (
          <>
            <SafeImage
              src={imageSrc}
              alt={name}
              className="object-contain transition-transform duration-500 motion-safe:group-hover:scale-105"
              sizes="(max-width: 639px) 33vw, 20vw"
            />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <SecurityCamera size={32} weight="duotone" className="text-border" aria-hidden="true" />
          </div>
        )}

        {/* Category badge only */}
        <div className="absolute top-2 right-2">
          <div
            className="inline-flex items-center gap-1 bg-background/90 backdrop-blur-sm rounded-md border border-border/60 shrink-0 px-1.5 py-1.5 sm:px-2"
            title={categoryLabel}
          >
            <span className="text-muted-foreground shrink-0">{categoryIcon}</span>
            <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-widest text-muted-foreground leading-tight max-w-22.5 truncate">
              {categoryLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-2.5 p-3 flex-1">
        <p className="text-[12px] font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-150">
          {name}
        </p>

        <div className="mt-auto pt-1 flex items-end justify-between gap-2">
          {isService ? (
            <span className="text-[11px] text-muted-foreground italic">{priceOnRequestLabel}</span>
          ) : product.originalPrice && product.originalPrice > product.price ? (
            <div className="flex flex-col leading-none gap-0.5">
              <span className="text-sm text-destructive/60 line-through tabular-nums">
                {product.originalPrice.toLocaleString()}₾
              </span>
              <div className="flex items-baseline gap-0.5">
                <span className={cn('text-[18px] font-black tabular-nums leading-none', saleColor === 'success' ? 'text-success' : 'text-destructive')}>
                  {product.price.toLocaleString()}
                </span>
                <span className={cn('text-[12px] font-bold leading-none mb-px', saleColor === 'success' ? 'text-success' : 'text-destructive')}>₾</span>
              </div>
            </div>
          ) : (
            <div className="flex items-baseline gap-0.5">
              <span className="text-[18px] font-black text-foreground tabular-nums leading-none">
                {product.price.toLocaleString()}
              </span>
              <span className="text-[12px] font-bold text-primary leading-none mb-px">₾</span>
            </div>
          )}

          <div
            className={cn(
              'w-6 h-6 rounded-lg flex items-center justify-center shrink-0',
              'bg-primary/10 border border-primary/20',
              'group-hover:bg-primary group-hover:border-primary',
              'transition-all duration-200'
            )}
            aria-hidden="true"
          >
            <ArrowRight
              size={11}
              weight="bold"
              className="text-primary group-hover:text-primary-foreground transition-colors duration-200"
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
