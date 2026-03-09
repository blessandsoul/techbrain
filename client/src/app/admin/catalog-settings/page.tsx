'use client';

import { AdminGuard } from '@/features/admin/components/AdminGuard';
import { AdminHeader } from '@/features/admin/components/AdminHeader';
import { CatalogSettingsEditor } from '@/features/admin/components/CatalogSettingsEditor';
import { useAdminCatalogConfig } from '@/features/admin/hooks/useCatalogConfig';
import { Skeleton } from '@/components/ui/skeleton';

function CatalogSettingsContent(): React.ReactElement {
  const { data: config, isLoading, isError } = useAdminCatalogConfig();

  if (isLoading) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-8">
        <Skeleton className="h-7 w-64 mb-6" />
        <div className="space-y-6">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !config) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-8">
        <p className="text-sm text-destructive">კონფიგურაციის ჩატვირთვა ვერ მოხერხდა.</p>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-8">
      <h1 className="text-xl font-semibold text-foreground mb-6">კატალოგის პარამეტრები</h1>
      <CatalogSettingsEditor initialConfig={config} />
    </div>
  );
}

export default function CatalogSettingsPage(): React.ReactElement {
  return (
    <AdminGuard>
      <AdminHeader />
      <CatalogSettingsContent />
    </AdminGuard>
  );
}
