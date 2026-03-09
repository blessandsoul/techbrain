import type { Metadata } from 'next';
import type React from 'react';
import { Geist, Geist_Mono, Noto_Sans_Georgian } from 'next/font/google';

import { Providers } from './providers';
import { APP_NAME } from '@/lib/constants/app.constants';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const notoSansGeorgian = Noto_Sans_Georgian({
  subsets: ['georgian', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-noto',
  display: 'swap',
});

export const metadata: Metadata = {
  title: APP_NAME,
  description: 'A full-stack application built with Next.js and Fastify',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return (
    <html lang="ka" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} ${notoSansGeorgian.variable} font-sans antialiased`} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
