'use client';

import Link from 'next/link';

import { AdminLink } from './AdminLink';
import { LocaleSwitcher } from './LocaleSwitcher';
import { CartIcon } from '@/components/common/CartIcon';
import { HeaderScrollWrapper } from './HeaderScrollWrapper';
import { Logo } from './Logo';
import { MobileMenu } from './MobileMenu';
import { formatPhone } from '@/lib/utils/format';
import { usePublicSiteSettings } from '@/hooks/useSiteSettings';
import { useLocale } from '@/lib/i18n';

import type { TranslationKey } from '@/lib/i18n';

const NAV_LINKS: { href: string; labelKey: TranslationKey }[] = [
  { href: '/', labelKey: 'nav.home' },
  { href: '/catalog', labelKey: 'nav.shop' },
  { href: '/blog', labelKey: 'nav.articles' },
  { href: '/projects', labelKey: 'nav.projects' },
  { href: '/contact', labelKey: 'nav.contact' },
];

export function Header(): React.ReactElement {
  const { contact } = usePublicSiteSettings();
  const { t } = useLocale();
  const phone = contact.whatsapp || contact.phone;
  const navLinks = NAV_LINKS.map((link) => ({ href: link.href, label: t(link.labelKey) }));

  return (
    <div className="fixed top-0 inset-x-0 z-50 w-full font-noto">

      {/* Main header — transparent until scrolled */}
      <HeaderScrollWrapper>
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          <div className="flex items-center justify-between h-17">

            {/* Logo */}
            <Link
              href="/"
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded-lg"
              aria-label={`TechBrain — ${t('nav.home')}`}
            >
              <Logo height={48} />
            </Link>

            {/* Nav */}
            <nav className="hidden lg:flex items-center gap-0.5" aria-label="Main navigation">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-2.5 xl:px-4 py-2 text-sm xl:text-base text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right */}
            <div className="flex items-center gap-1 lg:gap-2 xl:gap-3">

              {/* Desktop only — premium signal chip */}
              <a
                href={`https://wa.me/995${phone}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`WhatsApp ${phone}`}
                className="group hidden min-[560px]:flex items-center gap-2.5 h-9 pl-2.5 pr-3.5 rounded-full border border-border/60 bg-background hover:border-online/40 hover:bg-online/5 hover:shadow-[0_0_0_3px_hsl(var(--online)/0.08)] transition-all duration-300 ease-out cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-online/40"
              >
                {/* Pulse dot cluster */}
                <span className="relative flex items-center justify-center w-4 h-4 shrink-0" aria-hidden="true">
                  <span className="motion-safe:animate-ping absolute inline-flex h-3 w-3 rounded-full bg-online/30" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-online shadow-[0_0_6px_hsl(var(--online)/0.8)]" />
                </span>

                {/* Label */}
                <span className="flex flex-col leading-none">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-online/70 group-hover:text-online transition-colors duration-200">
                    WhatsApp
                  </span>
                  <span className="text-sm font-bold text-foreground tabular-nums tracking-wide">
                    {formatPhone(phone)}
                  </span>
                </span>
              </a>

              <div className="h-5 w-px bg-border/60 hidden lg:block" />
              <AdminLink />
              <LocaleSwitcher />
              <CartIcon />
              <MobileMenu links={navLinks} phone={phone} />
            </div>

          </div>
        </div>
      </HeaderScrollWrapper>
    </div>
  );
}
