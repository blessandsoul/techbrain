'use client';

import type React from 'react';
import { useEffect } from 'react';

import { usePathname, useRouter } from 'next/navigation';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ROUTES } from '@/lib/constants/routes';
import { authService } from '../services/auth.service';
import { setUser, setInitialized } from '../store/authSlice';

const AUTH_PAGES: string[] = [ROUTES.ADMIN.LOGIN];
const PROTECTED_PREFIXES: string[] = ['/admin/', '/dashboard', '/profile'];

interface AuthInitializerProps {
  children: React.ReactNode;
}

export const AuthInitializer = ({ children }: AuthInitializerProps): React.ReactElement => {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoggingOut } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

    // Public pages: skip auth check entirely
    if (!isProtected || AUTH_PAGES.includes(pathname)) {
      dispatch(setInitialized());
      return;
    }
    if (isAuthenticated || isLoggingOut) return;

    let cancelled = false;

    authService
      .getMe()
      .then((user) => {
        if (!cancelled) dispatch(setUser(user));
      })
      .catch((error) => {
        if (cancelled) return;
        dispatch(setInitialized());
        // Only redirect on auth errors (401/403), not network failures
        const status = error?.response?.status;
        if (status === 401 || status === 403) {
          router.push(ROUTES.ADMIN.LOGIN);
        }
      });

    return (): void => {
      cancelled = true;
    };
  }, [dispatch, pathname, isAuthenticated, isLoggingOut, router]);

  return <>{children}</>;
};
