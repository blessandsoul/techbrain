import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ProductCTA } from '../ProductCTA';

import type { IProduct } from '../../types/catalog.types';

const { addItemMock } = vi.hoisted(() => ({
  addItemMock: vi.fn(),
}));

vi.mock('@/features/cart/store/cartStore', () => ({
  useCartStore: (selector: (state: { addItem: typeof addItemMock }) => unknown) =>
    selector({ addItem: addItemMock }),
}));

describe('ProductCTA', () => {
  it('keeps quantity, cart, and buy controls in one compact mobile row', () => {
    const product = { inStock: true } as IProduct;
    const { container } = render(<ProductCTA product={product} />);

    const decrement = screen.getByRole('button', { name: 'Quantity -' });
    const cart = screen.getByRole('button', { name: 'Add to cart' });
    const buy = screen.getByText('catalog.buy').closest('button');

    expect(container.firstElementChild).toHaveClass(
      'grid',
      'grid-cols-[auto_minmax(0,1fr)_auto]',
      'gap-2',
    );
    expect(decrement).toHaveClass('h-9', 'w-7', 'sm:h-10', 'sm:w-10');
    expect(cart).toHaveClass('h-9', 'min-w-0', 'px-1.5', 'text-[11px]');
    expect(buy).toHaveClass('h-9', 'shrink-0', 'px-2', 'text-[11px]');
  });
});
