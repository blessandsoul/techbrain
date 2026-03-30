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
    <div className="flex flex-wrap items-center gap-3 w-full">
      {/* Quantity stepper */}
      <div className="flex items-center rounded-xl border border-border bg-background shrink-0">
        <button
          onClick={handleDecrement}
          disabled={quantity <= 1 || added || outOfStock}
          className="flex items-center justify-center w-10 h-10 rounded-l-xl text-muted-foreground transition-colors duration-150 cursor-pointer hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 active:scale-[0.95]"
          aria-label="Quantity -"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
          </svg>
        </button>

        <span className="w-10 text-center text-sm font-semibold text-foreground tabular-nums select-none">
          {quantity}
        </span>

        <button
          onClick={handleIncrement}
          disabled={quantity >= 99 || added || outOfStock}
          className="flex items-center justify-center w-10 h-10 rounded-r-xl text-muted-foreground transition-colors duration-150 cursor-pointer hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 active:scale-[0.95]"
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
        className={`flex-1 flex items-center justify-center gap-2 h-10 px-4 rounded-xl border text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 active:scale-[0.98] ${
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
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
            </svg>
            <span>{t('catalog.cart')}</span>
          </>
        )}
      </button>

      {/* Buy now button */}
      <button
        onClick={handleBuyNow}
        disabled={outOfStock}
        className={`flex items-center justify-center gap-2 h-10 px-5 rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 active:scale-[0.98] ${
          outOfStock
            ? 'opacity-50 cursor-not-allowed bg-primary/50 text-primary-foreground'
            : 'bg-primary text-primary-foreground cursor-pointer hover:brightness-110'
        }`}
      >
        {t('catalog.buy')}
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
        </svg>
      </button>
    </div>
  );
}
