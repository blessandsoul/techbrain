import type React from 'react';

import { MainLayout } from '@/components/layout/MainLayout';
import { SiteGate } from '@/components/common/SiteGate'; // TEMPORARY — remove when publishing

export default function MainGroupLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <SiteGate>
      <MainLayout>{children}</MainLayout>
    </SiteGate>
  );
}
