'use client';

import { useState, useEffect } from 'react';

import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setUser } from '@/features/auth/store/authSlice';
import { authService } from '@/features/auth/services/auth.service';
import { getErrorMessage } from '@/lib/utils/error';
import { ROUTES } from '@/lib/constants/routes';

import type { ILoginRequest } from '@/features/auth/types/auth.types';

export default function AdminLoginPage(): React.ReactElement {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isInitializing } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Auto-redirect if already authenticated as admin
  useEffect(() => {
    if (!isInitializing && isAuthenticated && user?.role === 'ADMIN') {
      router.replace(ROUTES.ADMIN.DASHBOARD);
    }
  }, [isInitializing, isAuthenticated, user, router]);

  const loginMutation = useMutation({
    mutationFn: (data: ILoginRequest) => authService.login(data),
    onSuccess: async (data) => {
      if (data.user.role !== 'ADMIN') {
        // Logout the non-admin user to clean up their session cookies
        try { await authService.logout(); } catch { /* ignore */ }
        setError('ადმინის უფლებები აუცილებელია');
        return;
      }
      dispatch(setUser(data.user));
      router.push(ROUTES.ADMIN.DASHBOARD);
    },
    onError: (err) => {
      setError(getErrorMessage(err));
    },
  });

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault();
    setError('');
    loginMutation.mutate({ email, password });
  }

  // Show nothing while checking existing auth
  if (isInitializing) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-muted/50">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-muted/50 px-4">
      <div className="w-full max-w-sm p-8 rounded-2xl bg-card border border-border shadow-sm">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-7 h-7 bg-foreground rounded-lg flex items-center justify-center">
            <span className="text-background font-bold text-xs">TB</span>
          </div>
          <span className="font-semibold text-foreground text-lg">TechBrain ადმინი</span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="admin-email" className="text-sm text-muted-foreground mb-1.5">
              ელ. ფოსტა
            </Label>
            <Input
              id="admin-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              autoComplete="email"
            />
          </div>

          <div>
            <Label htmlFor="admin-password" className="text-sm text-muted-foreground mb-1.5">
              პაროლი
            </Label>
            <Input
              id="admin-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="შეიყვანეთ პაროლი"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="text-destructive text-sm" role="alert">{error}</p>
          )}

          <Button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full"
          >
            {loginMutation.isPending ? 'შესვლა...' : 'შესვლა'}
          </Button>
        </form>
      </div>
    </div>
  );
}
