import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import CartPage from '../page';

vi.mock('@/features/cart/store/cartStore', () => ({
  useCartStore: () => ({
    items: [
      {
        product: {
          id: 'camera-1',
          slug: 'camera-1',
          categories: ['cameras'],
          price: 120,
          discount: null,
          currency: 'GEL',
          isActive: true,
          isFeatured: false,
          inStock: true,
          images: [],
          videoUrl: null,
          name: { ka: 'კამერა', ru: 'Камера', en: 'Camera' },
          description: { ka: '', ru: '', en: '' },
          specs: [],
          createdAt: '2026-08-12T00:00:00.000Z',
        },
        quantity: 1,
      },
    ],
    removeItem: vi.fn(),
    updateQuantity: vi.fn(),
    getTotalPrice: () => 120,
  }),
}));

describe('CartPage paused ordering state', () => {
  it('keeps checkout details disabled and offers a callable phone number', () => {
    render(<CartPage />);

    expect(screen.getByText('დროებით შეჩერებულია')).toBeVisible();
    const nameInput = screen.getByLabelText('სახელი და გვარი');
    expect(nameInput).toBeDisabled();
    expect(screen.getByLabelText('მობილურის ნომერი')).toBeDisabled();
    expect(screen.getByLabelText('მისამართი')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'შეკვეთა' })).toBeDisabled();

    const callLink = screen.getByRole('link', { name: 'დარეკეთ ნომერზე 597 47 05 18' });
    expect(callLink).toHaveAttribute('href', 'tel:+995597470518');
    expect(callLink).toHaveTextContent('597 47 05 18');
    expect(
      callLink.compareDocumentPosition(nameInput) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});
