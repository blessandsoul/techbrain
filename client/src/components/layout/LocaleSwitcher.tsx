'use client';

import { useState, useRef, useEffect } from 'react';
import { CaretDown } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { useLocale } from '@/lib/i18n';

import type { Locale } from '@/lib/i18n';

function FlagGE(): React.ReactElement {
  return (
    <svg viewBox="0 0 20 14" className="w-5 h-3.5 rounded-sm shrink-0" aria-hidden="true">
      <rect width="20" height="14" fill="white" />
      <rect x="8.5" width="3" height="14" fill="#FF0000" />
      <rect y="5.5" width="20" height="3" fill="#FF0000" />
      <rect x="1.5" y="1.5" width="2" height="1" fill="#FF0000" />
      <rect x="2" y="1" width="1" height="2" fill="#FF0000" />
      <rect x="15.5" y="1.5" width="2" height="1" fill="#FF0000" />
      <rect x="16" y="1" width="1" height="2" fill="#FF0000" />
      <rect x="1.5" y="10.5" width="2" height="1" fill="#FF0000" />
      <rect x="2" y="10" width="1" height="2" fill="#FF0000" />
      <rect x="15.5" y="10.5" width="2" height="1" fill="#FF0000" />
      <rect x="16" y="10" width="1" height="2" fill="#FF0000" />
    </svg>
  );
}

function FlagRU(): React.ReactElement {
  return (
    <svg viewBox="0 0 20 14" className="w-5 h-3.5 rounded-sm shrink-0" aria-hidden="true">
      <rect width="20" height="4.67" fill="white" />
      <rect y="4.67" width="20" height="4.67" fill="#003DA5" />
      <rect y="9.33" width="20" height="4.67" fill="#CC0000" />
    </svg>
  );
}

function FlagGB(): React.ReactElement {
  return (
    <svg viewBox="0 0 20 14" className="w-5 h-3.5 rounded-sm shrink-0" aria-hidden="true">
      <rect width="20" height="14" fill="#012169" />
      <path d="M0,0 L20,14 M20,0 L0,14" stroke="white" strokeWidth="2.4" />
      <path d="M0,0 L20,14 M20,0 L0,14" stroke="#C8102E" strokeWidth="1.6" />
      <rect x="8.5" width="3" height="14" fill="white" />
      <rect y="5.5" width="20" height="3" fill="white" />
      <rect x="9" width="2" height="14" fill="#C8102E" />
      <rect y="6" width="20" height="2" fill="#C8102E" />
    </svg>
  );
}

const LOCALES = [
  { code: 'ka', label: 'GEO', Flag: FlagGE },
  { code: 'ru', label: 'RUS', Flag: FlagRU },
  { code: 'en', label: 'ENG', Flag: FlagGB },
] as const;

export function LocaleSwitcher(): React.ReactElement {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent): void {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function switchLocale(newLocale: Locale): void {
    setLocale(newLocale);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Select language"
        className="flex items-center gap-1 p-2 rounded-lg hover:bg-accent transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      >
        <current.Flag />
        <CaretDown
          size={10}
          weight="bold"
          className={cn('text-muted-foreground transition-transform duration-200', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1.5 w-14 rounded-xl bg-card border border-border/50 overflow-hidden z-50 motion-safe:animate-[slide-fade-in_0.15s_ease-out]"
          role="listbox"
          aria-label="Language options"
        >
          {LOCALES.map((l) => (
            <button
              key={l.code}
              role="option"
              aria-selected={locale === l.code}
              onClick={() => switchLocale(l.code as Locale)}
              className={cn(
                'w-full flex items-center justify-center px-3 py-2.5 transition-colors duration-150 cursor-pointer',
                locale === l.code
                  ? 'bg-primary/10'
                  : 'hover:bg-accent'
              )}
            >
              <l.Flag />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
