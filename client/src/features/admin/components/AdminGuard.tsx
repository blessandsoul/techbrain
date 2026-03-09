'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { useAppSelector } from '@/store/hooks';
import { ROUTES } from '@/lib/constants/routes';

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps): React.ReactElement | null {
  const router = useRouter();
  const { user, isAuthenticated, isInitializing } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isInitializing && (!isAuthenticated || user?.role !== 'ADMIN')) {
      router.replace(ROUTES.ADMIN.LOGIN);
    }
  }, [isInitializing, isAuthenticated, user, router]);

  if (isInitializing) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-muted/50">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return null;
  }

  return <>{children}</>;
}
