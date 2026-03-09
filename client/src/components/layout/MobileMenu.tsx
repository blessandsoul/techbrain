'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { List, X } from '@phosphor-icons/react';
import { formatPhone } from '@/lib/utils/format';

interface MobileMenuProps {
  links: { href: string; label: string }[];
  phone: string;
}

export function MobileMenu({ links, phone }: MobileMenuProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      {/* Hamburger button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg hover:bg-accent transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
      >
        {open ? (
          <X size={20} weight="bold" className="text-foreground" />
        ) : (
          <List size={20} weight="bold" className="text-foreground" />
        )}
      </button>

      {/* Overlay + Drawer */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer */}
          <nav
            className="fixed top-0 right-0 z-[70] w-64 h-[100dvh] bg-background border-l border-border flex flex-col lg:hidden motion-safe:animate-in motion-safe:slide-in-from-right"
            aria-label="Mobile navigation"
          >
            {/* Close */}
            <div className="flex items-center justify-end p-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-accent transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <X size={20} weight="bold" className="text-foreground" />
              </button>
            </div>

            {/* Links */}
            <div className="flex flex-col gap-1 px-4">
              {links.map((link) => {
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-3 text-base rounded-lg transition-colors ${
                      isActive
                        ? 'text-foreground font-medium bg-accent'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* WhatsApp — visible only when header chip is hidden (<560px) */}
            <div className="mt-auto px-4 pb-6 min-[560px]:hidden">
              <a
                href={`https://wa.me/995${phone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-online/10 transition-colors hover:bg-online/15"
              >
                <span className="relative flex items-center justify-center w-4 h-4 shrink-0" aria-hidden="true">
                  <span className="motion-safe:animate-ping absolute inline-flex h-3 w-3 rounded-full bg-online/30" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-online shadow-[0_0_6px_hsl(var(--online)/0.8)]" />
                </span>
                <span className="flex flex-col leading-none">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-online/70">
                    WhatsApp
                  </span>
                  <span className="text-sm font-bold text-foreground tabular-nums tracking-wide">
                    {formatPhone(phone)}
                  </span>
                </span>
              </a>
            </div>
          </nav>
        </>
      )}
    </>
  );
}
