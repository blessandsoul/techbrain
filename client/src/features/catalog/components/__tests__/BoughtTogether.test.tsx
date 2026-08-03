import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { BoughtTogether } from '../BoughtTogether';

import type { IProduct } from '../../types/catalog.types';

const { addItemMock } = vi.hoisted(() => ({
  addItemMock: vi.fn(),
}));

vi.mock('@/features/cart/store/cartStore', () => ({
  useCartStore: (selector: (state: { addItem: typeof addItemMock }) => unknown) =>
    selector({ addItem: addItemMock }),
}));

vi.mock('@/components/common/SafeImage', () => ({
  SafeImage: ({ src, alt }: { src: string; alt: string }) => (
    <span role="img" aria-label={alt} data-src={src} />
  ),
}));

function product(id: string, name: string, price: number, originalPrice?: number): IProduct {
  return {
    id,
    slug: id,
    name: { ka: name, ru: '', en: '' },
    price,
    originalPrice,
    images: [],
    inStock: true,
  } as IProduct;
}

describe('BoughtTogether', () => {
  it('keeps footer prices and the buy-all action intact at narrow widths', () => {
    render(
      <BoughtTogether
        mainProduct={product('main', 'Main camera', 1450, 1700)}
        relatedProducts={[product('power', 'Power supply', 355)]}
      />,
    );

    const buyAll = screen.getByRole('button', { name: 'Buy all together' });
    const footer = buyAll.parentElement;

    expect(footer).toHaveClass(
      'grid',
      'grid-cols-[minmax(0,1fr)_auto]',
      'gap-2',
      'px-3',
    );
    expect(buyAll).toHaveClass('shrink-0', 'whitespace-nowrap', 'px-3', 'text-xs');
    expect(screen.getByText('catalog.buyAll')).toHaveClass('whitespace-nowrap');
    expect(screen.getByText('2,055 ₾')).toHaveClass('whitespace-nowrap');
    expect(screen.getByText('1,805 ₾')).toHaveClass('whitespace-nowrap');
    expect(screen.getByText('1,700 ₾')).toHaveClass('whitespace-nowrap');
    expect(screen.getByText('1,450 ₾')).toHaveClass('whitespace-nowrap');
  });
});
