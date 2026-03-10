import type React from 'react';

import { AnnouncementBanner } from './AnnouncementBanner';
import { Header } from './Header';
import { Footer } from './Footer';
import { MobileBottomBar } from './MobileBottomBar';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps): React.ReactElement => {
  return (
    <div className="flex min-h-dvh flex-col pt-17">
      <AnnouncementBanner />
      <Header />
      <main className="flex flex-1 flex-col">{children}</main>
      <Footer />
      <MobileBottomBar />
    </div>
  );
};
