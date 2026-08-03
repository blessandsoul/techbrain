import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { PopularProductsSlider } from '../PopularProductsSlider';

import type { IProduct } from '../../types/catalog.types';

vi.mock('@/components/common/SafeImage', () => ({
  SafeImage: ({ src, alt }: { src: string; alt: string }) => (
    <span role="img" aria-label={alt} data-src={src} />
  ),
}));

describe('PopularProductsSlider', () => {
  it('keeps horizontal scrolling while hiding the native scrollbar', () => {
    const product = {
      id: 'camera',
      slug: 'camera',
      categories: ['cameras'],
      name: { ka: 'Camera', ru: '', en: '' },
      images: [],
      price: 450,
    } as IProduct;

    render(
      <PopularProductsSlider
        products={[product]}
        title="Recommended products"
        subtitle="Recommended"
      />,
    );

    expect(screen.getByRole('list')).toHaveClass(
      'overflow-x-auto',
      'scroll-smooth',
      'scrollbar-none',
    );
  });
});
