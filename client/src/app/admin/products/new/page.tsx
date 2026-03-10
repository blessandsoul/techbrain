'use client';

import { AdminGuard } from '@/features/admin/components/AdminGuard';
import { AdminHeader } from '@/features/admin/components/AdminHeader';
import { ProductForm } from '@/features/admin/components/ProductForm';

function NewProductContent(): React.ReactElement {
  return (
    <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-8">
      <h1 className="text-xl font-semibold text-foreground mb-8">ახალი პროდუქტის დამატება</h1>
      <ProductForm />
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
