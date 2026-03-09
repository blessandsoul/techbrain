'use client';

import Link from 'next/link';

import { useCartStore } from '@/features/cart/store/cartStore';
import { ROUTES } from '@/lib/constants/routes';

export function CartIcon(): React.ReactElement {
  const totalItems = useCartStore((s) => s.getTotalItems());

  return (
    <Link
      href={ROUTES.CART}
      className="relative flex items-center justify-center w-9 h-9 md:w-11 md:h-11 rounded-xl hover:bg-accent transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      aria-label={`Cart (${totalItems} items)`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} className="text-foreground" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
      </svg>
      {totalItems > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold bg-primary text-primary-foreground rounded-full leading-none">
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}
    </Link>
  );
}
