import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { MobileBottomBar } from '../MobileBottomBar';

const { usePublicSiteSettingsMock } = vi.hoisted(() => ({
  usePublicSiteSettingsMock: vi.fn(),
}));

vi.mock('@/hooks/useSiteSettings', () => ({
  usePublicSiteSettings: usePublicSiteSettingsMock,
}));

describe('MobileBottomBar', () => {
  it('keeps both configured actions visible without clipping their labels', () => {
    usePublicSiteSettingsMock.mockReturnValue({
      contact: { phone: '597470518', whatsapp: '' },
      social: { facebook: 'https://facebook.com/techbrain' },
    });

    const { container } = render(<MobileBottomBar />);

    const whatsapp = screen.getByRole('link', { name: 'WhatsApp' });
    const facebook = screen.getByRole('link', { name: 'Facebook' });

    expect(whatsapp).toBeVisible();
    expect(facebook).toBeVisible();
    expect(whatsapp).not.toHaveClass('overflow-hidden');
    expect(facebook).not.toHaveClass('overflow-hidden');
    expect(screen.getByText('597 47 05 18')).not.toHaveClass('truncate');
    expect(screen.getByText('Facebook')).not.toHaveClass('truncate');
    expect(container.firstElementChild).toHaveClass('w-[calc(100vw-1.5rem)]', 'max-w-md');
    expect(container.querySelector('.grid')).toHaveClass('grid-cols-2');
  });

  it('uses the production destinations as fallbacks when settings are empty', () => {
    usePublicSiteSettingsMock.mockReturnValue({
      contact: { phone: '', whatsapp: '' },
      social: { facebook: '' },
    });

    render(<MobileBottomBar />);

    expect(screen.getByRole('link', { name: 'WhatsApp' })).toHaveAttribute('href', 'https://wa.me/995597470518');
    expect(screen.getByRole('link', { name: 'Facebook' })).toHaveAttribute('href', 'https://facebook.com/TechbrainGE');
    expect(screen.getByText('597 47 05 18')).toBeVisible();
  });
});
