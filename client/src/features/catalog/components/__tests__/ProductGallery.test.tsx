import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ProductGallery } from '../ProductGallery';

vi.mock('@/components/common/SafeImage', () => ({
  SafeImage: ({ src, alt, className }: { src: string; alt: string; className?: string }) => (
    <span role="img" aria-label={alt} data-src={src} className={className} />
  ),
}));

describe('ProductGallery image fit', () => {
  it('shows the whole photo (contain), never cropped, in the main image and in every thumbnail', () => {
    const { container } = render(<ProductGallery images={['wide.jpg', 'tall.jpg']} productName="Recorder" />);

    const photos = container.querySelectorAll('[data-src]');

    expect(photos).toHaveLength(3); // the main image plus one thumbnail per image
    photos.forEach((photo) => {
      expect(photo).toHaveClass('object-contain');
      expect(photo).not.toHaveClass('object-cover');
    });
  });
});

describe('ProductGallery lightbox', () => {
  it('shows compact high-contrast previous and next controls above the image', async () => {
    const user = userEvent.setup();
    render(<ProductGallery images={['one.jpg', 'two.jpg']} productName="Camera" />);

    await user.click(screen.getByRole('button', { name: 'Open fullscreen image' }));

    const dialog = screen.getByRole('dialog', { name: 'Fullscreen image viewer' });
    const previous = within(dialog).getByRole('button', { name: 'Previous image' });
    const next = within(dialog).getByRole('button', { name: 'Next image' });

    expect(dialog).toHaveClass('z-[60]');
    expect(previous).toHaveClass('z-20', 'h-9', 'w-9', 'sm:h-11', 'sm:w-11', 'bg-black/70', 'border-white/40');
    expect(next).toHaveClass('z-20', 'h-9', 'w-9', 'sm:h-11', 'sm:w-11', 'bg-black/70', 'border-white/40');
    expect(previous).toBeVisible();
    expect(next).toBeVisible();
    expect(within(dialog).getByText('1 / 2')).toBeVisible();

    await user.click(next);
    expect(within(dialog).getByText('2 / 2')).toBeVisible();
  });

  it('does not show navigation controls for a single image', async () => {
    const user = userEvent.setup();
    render(<ProductGallery images={['only.jpg']} productName="Camera" />);

    await user.click(screen.getByRole('button', { name: 'Open fullscreen image' }));

    const dialog = screen.getByRole('dialog', { name: 'Fullscreen image viewer' });
    expect(within(dialog).queryByRole('button', { name: 'Previous image' })).not.toBeInTheDocument();
    expect(within(dialog).queryByRole('button', { name: 'Next image' })).not.toBeInTheDocument();
  });
});
