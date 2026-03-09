'use client';

import { AdminGuard } from '@/features/admin/components/AdminGuard';
import { AdminHeader } from '@/features/admin/components/AdminHeader';
import { SiteSettingsEditor } from '@/features/admin/components/SiteSettingsEditor';

export default function SiteSettingsPage(): React.ReactElement {
  return (
    <AdminGuard>
      <AdminHeader />
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-8">
        <h1 className="text-xl font-semibold text-foreground mb-6">საიტის პარამეტრები</h1>
        <SiteSettingsEditor />
      </div>
    </AdminGuard>
  );
}
