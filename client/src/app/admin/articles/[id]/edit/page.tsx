'use client';

import { use } from 'react';

import { AdminGuard } from '@/features/admin/components/AdminGuard';
import { AdminHeader } from '@/features/admin/components/AdminHeader';
import { ArticleForm } from '@/features/admin/components/ArticleForm';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminArticle } from '@/features/admin/hooks/useArticles';

function EditArticleContent({ id }: { id: string }): React.ReactElement {
  const { data: article, isLoading } = useAdminArticle(id);

  if (isLoading) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-8">
        <Skeleton className="h-8 w-64 mb-8" />
        <div className="max-w-3xl space-y-4">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-8">
        <p className="text-muted-foreground">სტატია ვერ მოიძებნა</p>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-8">
      <h1 className="text-xl font-semibold text-foreground mb-8">რედაქტირება: {article.title}</h1>
      <ArticleForm article={article} />
    </div>
  );
}

export default function EditArticlePage({ params }: { params: Promise<{ id: string }> }): React.ReactElement {
  const { id } = use(params);

  return (
    <AdminGuard>
      <AdminHeader />
      <EditArticleContent id={id} />
    </AdminGuard>
  );
}
