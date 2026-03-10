'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { AdminGuard } from '@/features/admin/components/AdminGuard';
import { AdminHeader } from '@/features/admin/components/AdminHeader';
import { ProductForm } from '@/features/admin/components/ProductForm';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminProducts } from '@/features/admin/hooks/useAdminProducts';

function EditProductContent({ productId }: { productId: string }): React.ReactElement {
  const router = useRouter();
  const { data, isLoading } = useAdminProducts({ limit: 100 });
  const product = (data?.items ?? []).find((p) => p.id === productId);

  if (isLoading) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-8">
        <Skeleton className="h-8 w-64 mb-8" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-8 text-center">
        <p className="text-muted-foreground mb-4">პროდუქტი ვერ მოიძებნა</p>
        <button
          onClick={() => router.push('/admin/dashboard')}
          className="text-primary underline"
        >
          დაბრუნება
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-8">
      <h1 className="text-xl font-semibold text-foreground mb-8">პროდუქტის რედაქტირება</h1>
      <ProductForm product={product} />
    </div>
  );
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }): React.ReactElement {
  const { id } = use(params);
  return (
    <AdminGuard>
      <AdminHeader />
      <EditProductContent productId={id} />
    </AdminGuard>
  );
}
