import '@testing-library/jest-dom/vitest';
import { createElement } from 'react';
import { vi } from 'vitest';

import type { ReactNode } from 'react';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  })),
  usePathname: vi.fn(() => '/'),
  useParams: vi.fn(() => ({})),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: ReactNode; href: string; [key: string]: unknown }) =>
    createElement('a', { href, ...props }, children),
}));

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

// Mock locale
vi.mock('@/lib/i18n', () => ({
  useLocale: vi.fn(() => ({
    locale: 'ka' as const,
    t: (key: string) => key,
    localized: (obj: { ka: string; ru: string; en: string }) => obj.ka,
  })),
}));
