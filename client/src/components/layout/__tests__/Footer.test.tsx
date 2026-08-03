import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Footer } from '../Footer';

vi.mock('@/hooks/useSiteSettings', () => ({
  usePublicSiteSettings: () => ({
    contact: { phone: '597470518', whatsapp: '' },
    social: {
      facebook: 'https://facebook.com/techbrain',
      instagram: 'https://instagram.com/techbrain',
      tiktok: 'https://tiktok.com/@techbrain',
    },
    business: { companyName: 'TechBrain' },
  }),
}));

vi.mock('@/lib/i18n', () => ({
  useLocale: () => ({ t: () => 'All rights reserved.' }),
}));

describe('Footer', () => {
  it('stacks social links, the left-aligned phone, then copyright on mobile', () => {
    render(<Footer />);

    const copyright = screen.getByText(/TechBrain\. All rights reserved\./);
    const phone = screen.getByRole('link', { name: '597 47 05 18' });
    const row = copyright.parentElement;
    const socialLinks = screen.getByRole('link', { name: 'Facebook' }).parentElement;

    expect(row).toHaveClass('flex-col', 'items-start', 'md:flex-row');
    expect(socialLinks).toHaveClass('order-1');
    expect(phone).toHaveClass('order-2', 'max-w-full', 'shrink-0', 'md:order-3', 'md:ml-auto');
    expect(phone).not.toHaveClass('ml-auto');
    expect(copyright).toHaveClass('order-3', 'md:order-2');
  });
});
