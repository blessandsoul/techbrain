'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { useCartStore } from '@/features/cart/store/cartStore';
import { useLocale } from '@/lib/i18n';
import { ROUTES } from '@/lib/constants/routes';

import type { IProduct } from '../types/catalog.types';

interface ProductCTAProps {
  product: IProduct;
}

export function ProductCTA({ product }: ProductCTAProps): React.ReactElement {
  const { t } = useLocale();
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const outOfStock = !product.inStock;

  function handleDecrement(): void {
    setQuantity((prev) => Math.max(1, prev - 1));
  }

  function handleIncrement(): void {
    setQuantity((prev) => Math.min(99, prev + 1));
  }

  function handleAdd(): void {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      setQuantity(1);
    }, 1200);
  }

  function handleBuyNow(): void {
    addItem(product, quantity);
    router.push(ROUTES.CART);
  }

  return (
    <div className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2">
      {/* Quantity stepper */}
      <div className="flex items-center rounded-xl border border-border bg-background shrink-0">
        <button
          onClick={handleDecrement}
          disabled={quantity <= 1 || added || outOfStock}
          className="flex h-9 w-7 items-center justify-center rounded-l-xl text-muted-foreground transition-colors duration-150 cursor-pointer hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 active:scale-[0.95] sm:h-10 sm:w-10"
          aria-label="Quantity -"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
          </svg>
        </button>

        <span className="w-7 select-none text-center text-xs font-semibold text-foreground tabular-nums sm:w-10 sm:text-sm">
          {quantity}
        </span>

        <button
          onClick={handleIncrement}
          disabled={quantity >= 99 || added || outOfStock}
          className="flex h-9 w-7 items-center justify-center rounded-r-xl text-muted-foreground transition-colors duration-150 cursor-pointer hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 active:scale-[0.95] sm:h-10 sm:w-10"
          aria-label="Quantity +"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m-7-7h14" />
          </svg>
        </button>
      </div>

      {/* Add to cart button */}
      <button
        onClick={handleAdd}
        disabled={added || outOfStock}
        className={`flex h-9 min-w-0 items-center justify-center gap-1 rounded-xl border px-1.5 text-[11px] font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 active:scale-[0.98] sm:h-10 sm:gap-2 sm:px-4 sm:text-sm ${
          outOfStock
            ? 'opacity-50 cursor-not-allowed bg-muted border-border text-muted-foreground'
            : added
              ? 'bg-green-600/10 text-green-500 border-green-600/30 cursor-pointer'
              : 'bg-background border-border text-foreground hover:border-primary hover:text-primary cursor-pointer'
        }`}
        aria-label="Add to cart"
      >
        {added ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} className="shrink-0" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
            </svg>
            <span className="whitespace-nowrap">{t('catalog.cart')}</span>
          </>
        )}
      </button>

      {/* Buy now button */}
      <button
        onClick={handleBuyNow}
        disabled={outOfStock}
        className={`flex h-9 shrink-0 items-center justify-center gap-1 rounded-xl px-2 text-[11px] font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 active:scale-[0.98] sm:h-10 sm:gap-2 sm:px-5 sm:text-sm ${
          outOfStock
            ? 'opacity-50 cursor-not-allowed bg-primary/50 text-primary-foreground'
            : 'bg-primary text-primary-foreground cursor-pointer hover:brightness-110'
        }`}
      >
        {t('catalog.buy')}
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="shrink-0" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
        </svg>
      </button>
    </div>
  );
}
