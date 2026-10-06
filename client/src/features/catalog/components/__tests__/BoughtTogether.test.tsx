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

  // price 0 = "price on request": not purchasable online, so it must never appear as a "0 ₾" bundle row
  // or end up in the total / the cart.
  it('does not offer price-on-request products as bundle items', () => {
    render(
      <BoughtTogether
        mainProduct={product('main', 'Main camera', 1450)}
        relatedProducts={[product('switch', 'Network switch', 0), product('power', 'Power supply', 355)]}
      />,
    );

    expect(screen.queryByText('Network switch')).not.toBeInTheDocument();
    expect(screen.getByText('Power supply')).toBeInTheDocument();
    expect(screen.queryByText('0 ₾')).not.toBeInTheDocument();
    expect(screen.getByText('1,805 ₾')).toBeInTheDocument(); // 1450 + 355 only
  });

  it('renders no bundle when every suggested product is price on request', () => {
    const { container } = render(
      <BoughtTogether
        mainProduct={product('main', 'Main camera', 1450)}
        relatedProducts={[product('switch', 'Network switch', 0)]}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('renders no bundle when the main product itself is price on request', () => {
    const { container } = render(
      <BoughtTogether
        mainProduct={product('main', 'Contact-us camera', 0)}
        relatedProducts={[product('power', 'Power supply', 355)]}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
