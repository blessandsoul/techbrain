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
  it('wraps the phone below the footer content instead of widening narrow screens', () => {
    render(<Footer />);

    const copyright = screen.getByText(/TechBrain\. All rights reserved\./);
    const phone = screen.getByRole('link', { name: '597 47 05 18' });

    expect(copyright.parentElement).toHaveClass('flex-wrap', 'gap-y-3');
    expect(phone).toHaveClass('ml-auto', 'max-w-full', 'shrink-0');
  });
});
