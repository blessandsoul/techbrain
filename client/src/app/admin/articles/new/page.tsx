'use client';

import { AdminGuard } from '@/features/admin/components/AdminGuard';
import { AdminHeader } from '@/features/admin/components/AdminHeader';
import { ArticleForm } from '@/features/admin/components/ArticleForm';

export default function NewArticlePage(): React.ReactElement {
  return (
    <AdminGuard>
      <AdminHeader />
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-8">
        <h1 className="text-xl font-semibold text-foreground mb-8">ახალი სტატია</h1>
        <ArticleForm />
      </div>
    </AdminGuard>
  );
}
