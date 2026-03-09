'use client';

import type React from 'react';
import { useState } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider as ReduxProvider } from 'react-redux';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';

import { store } from '@/store';
import { AuthInitializer } from '@/features/auth/components/AuthInitializer';
import { LocaleProvider } from '@/lib/i18n';

export function Providers({ children }: { children: React.ReactNode }): React.ReactElement {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            gcTime: 10 * 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <LocaleProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} forcedTheme="light" disableTransitionOnChange>
            <AuthInitializer>
              {children}
            </AuthInitializer>
            <Toaster position="top-right" richColors />
          </ThemeProvider>
        </LocaleProvider>
      </QueryClientProvider>
    </ReduxProvider>
  );
}
