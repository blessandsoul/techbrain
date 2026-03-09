'use client';

import { AdminGuard } from '@/features/admin/components/AdminGuard';
import { AdminHeader } from '@/features/admin/components/AdminHeader';
import { ProductForm } from '@/features/admin/components/ProductForm';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminProducts } from '@/features/admin/hooks/useAdminProducts';

function NewProductContent(): React.ReactElement {
  const { data, isLoading } = useAdminProducts({ limit: 100 });
  const allProducts = data?.items ?? [];

  return (
    <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-8">
      <h1 className="text-xl font-semibold text-foreground mb-8">ახალი პროდუქტის დამატება</h1>
      {isLoading ? (
        <Skeleton className="h-96 w-full rounded-xl" />
      ) : (
        <ProductForm allProducts={allProducts} />
      )}
    </div>
  );
}

export default function NewProductPage(): React.ReactElement {
  return (
    <AdminGuard>
      <AdminHeader />
      <NewProductContent />
    </AdminGuard>
  );
}
