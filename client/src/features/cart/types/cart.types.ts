import type { IProduct } from '@/features/catalog/types/catalog.types';

export interface CartItem {
  product: IProduct;
  quantity: number;
}

export interface CartStore {
  items: CartItem[];
  addItem: (product: IProduct, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}
