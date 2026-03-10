'use client';

import { useState } from 'react';

import Link from 'next/link';

import { SafeImage } from '@/components/common/SafeImage';
import { useCartStore } from '@/features/cart/store/cartStore';
import { getProductImageUrl } from '@/features/catalog/hooks/useCatalog';
import { useCreateOrder } from '@/features/orders/hooks/useOrders';
import { ROUTES } from '@/lib/constants/routes';
import { getErrorMessage } from '@/lib/utils/error';

interface OrderForm {
  name: string;
  phone: string;
}

export default function CartPage(): React.ReactElement {
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice } = useCartStore();
  const createOrder = useCreateOrder();
  const [form, setForm] = useState<OrderForm>({ name: '', phone: '' });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (items.length === 0) return;
    setError('');

    try {
      await createOrder.mutateAsync({
        customerName: form.name,
        customerPhone: form.phone,
        locale: 'ka',
        items: items.map((i) => ({
          productId: i.product.id,
          productName: i.product.name.ka,
          productImage: i.product.images[0] || undefined,
          productSlug: i.product.slug,
          quantity: i.quantity,
          unitPrice: i.product.price,
        })),
        total: getTotalPrice(),
      });
      setSuccess(true);
      clearCart();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  if (success) {
    return (
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl py-24 text-center">
        <div className="max-w-md mx-auto p-8 rounded-2xl bg-card border border-border">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-primary">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-4">შეკვეთა მიღებულია!</h2>
          <p className="text-muted-foreground mb-6">მალე დაგიკავშირდებით</p>
          <div className="mt-8">
            <Link
              href={ROUTES.CATALOG}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              კატალოგში დაბრუნება
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-muted-foreground">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
          </svg>
        </div>
        <p className="text-muted-foreground mb-6 text-lg">კალათა ცარიელია</p>
        <Link
          href={ROUTES.CATALOG}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:brightness-110 text-primary-foreground font-medium rounded-xl transition-all duration-200"
        >
          კატალოგში დაბრუნება
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl py-12">
      <h1 className="text-3xl font-bold text-foreground mb-8">კალათა</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items list */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {items.map(({ product, quantity }) => {
            const hasImage = product.images.length > 0;
            const imgSrc = hasImage ? getProductImageUrl(product.images[0]) : null;

            return (
              <div
                key={product.id}
                className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl bg-card border border-border"
              >
                <Link href={`/catalog/${product.slug}`} className="flex gap-4 flex-1 min-w-0 group">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
                    {imgSrc ? (
                      <SafeImage
                        src={imgSrc}
                        alt={product.name.ka}
                        fill={false}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-8 h-8 text-border">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors duration-150">{product.name.ka}</p>
                    <p className="text-primary font-bold tabular-nums">{product.price} ₾</p>
                  </div>
                </Link>
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => updateQuantity(product.id, quantity - 1)}
                    className="w-8 h-8 rounded-lg bg-muted hover:bg-accent text-foreground flex items-center justify-center transition-colors cursor-pointer"
                    aria-label="რაოდენობის შემცირება"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                    </svg>
                  </button>
                  <span className="w-8 text-center text-foreground font-medium tabular-nums">{quantity}</span>
                  <button
                    onClick={() => updateQuantity(product.id, quantity + 1)}
                    className="w-8 h-8 rounded-lg bg-muted hover:bg-accent text-foreground flex items-center justify-center transition-colors cursor-pointer"
                    aria-label="რაოდენობის გაზრდა"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </button>
                  <button
                    onClick={() => removeItem(product.id)}
                    className="w-8 h-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex items-center justify-center transition-colors ml-2 cursor-pointer"
                    aria-label="ნივთის წაშლა"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sidebar: total + form */}
        <div className="flex flex-col gap-6">
          {/* Total */}
          <div className="p-6 rounded-xl bg-card border border-border">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">ჯამი</span>
              <span className="text-2xl font-bold text-foreground tabular-nums">{getTotalPrice()} ₾</span>
            </div>
          </div>

          {/* Order form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6 rounded-xl bg-card border border-border">
            <h2 className="font-semibold text-foreground">შეკვეთის გაფორმება</h2>

            <div>
              <label htmlFor="order-name" className="block text-sm text-muted-foreground mb-1.5">
                სახელი
              </label>
              <input
                id="order-name"
                type="text"
                required
                minLength={2}
                maxLength={100}
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="თქვენი სახელი"
                className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>

            <div>
              <label htmlFor="order-phone" className="block text-sm text-muted-foreground mb-1.5">
                ტელეფონი
              </label>
              <input
                id="order-phone"
                type="tel"
                required
                minLength={1}
                maxLength={30}
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="5XX XXX XXX"
                className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>

            {error && (
              <p className="text-destructive text-sm" role="alert">{error}</p>
            )}

            <button
              type="submit"
              disabled={createOrder.isPending}
              className="w-full py-3 bg-primary hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] text-primary-foreground font-semibold rounded-xl transition-all duration-200 cursor-pointer"
            >
              {createOrder.isPending ? 'იგზავნება...' : 'შეკვეთა'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
