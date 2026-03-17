'use client';

// ============================================================
// TEMPORARY SITE GATE — DELETE THIS FILE WHEN READY TO PUBLISH
// Also remove <SiteGate> from src/app/(main)/layout.tsx
// ============================================================

import { useState } from 'react';

import { useMutation } from '@tanstack/react-query';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setUser } from '@/features/auth/store/authSlice';
import { authService } from '@/features/auth/services/auth.service';
import { getErrorMessage } from '@/lib/utils/error';

import type React from 'react';
import type { ILoginRequest } from '@/features/auth/types/auth.types';

export function SiteGate({ children }: { children: React.ReactNode }): React.ReactElement {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isInitializing } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const loginMutation = useMutation({
    mutationFn: (data: ILoginRequest) => authService.login(data),
    onSuccess: (data) => {
      dispatch(setUser(data.user));
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

  // Show spinner while auth is initializing
  if (isInitializing) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-muted/50">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Already logged in — show the site
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Not logged in — show login overlay
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm p-8 rounded-2xl bg-card border border-border shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 bg-foreground rounded-lg flex items-center justify-center">
            <span className="text-background font-bold text-xs">TB</span>
          </div>
          <span className="font-semibold text-foreground text-lg">TechBrain</span>
        </div>

        <p className="text-sm text-muted-foreground mb-6">
          საიტი დროებით დაბლოკილია. შეიყვანეთ თქვენი მონაცემები.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="gate-email" className="text-sm text-muted-foreground mb-1.5">
              ელ. ფოსტა
            </Label>
            <Input
              id="gate-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              autoComplete="email"
              autoFocus
            />
          </div>

          <div>
            <Label htmlFor="gate-password" className="text-sm text-muted-foreground mb-1.5">
              პაროლი
            </Label>
            <Input
              id="gate-password"
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
