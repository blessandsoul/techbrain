'use client';

import Link from 'next/link';
import { GearSix } from '@phosphor-icons/react';
import { useAppSelector } from '@/store/hooks';

export function AdminLink(): React.ReactElement | null {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <Link
      href="/admin/dashboard"
      aria-label="Admin panel"
      className="flex items-center justify-center p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
    >
      <GearSix size={20} weight="bold" />
    </Link>
  );
}
