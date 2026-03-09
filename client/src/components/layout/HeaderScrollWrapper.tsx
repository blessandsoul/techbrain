'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface HeaderScrollWrapperProps {
  children: React.ReactNode;
}

export function HeaderScrollWrapper({ children }: HeaderScrollWrapperProps): React.ReactElement {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = (): void => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'border-b transition-all duration-300',
        scrolled
          ? 'bg-background/95 backdrop-blur-xl border-border/40 shadow-sm shadow-black/5'
          : 'bg-background border-transparent'
      )}
    >
      {children}
    </header>
  );
}
