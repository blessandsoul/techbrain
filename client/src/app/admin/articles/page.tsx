'use client';

import Link from 'next/link';

import { AdminGuard } from '@/features/admin/components/AdminGuard';
import { AdminHeader } from '@/features/admin/components/AdminHeader';
import { DeleteArticleButton } from '@/features/admin/components/DeleteArticleButton';
import { InfoTooltip } from '@/features/admin/components/InfoTooltip';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { useAdminArticles, useToggleArticlePublish } from '@/features/admin/hooks/useArticles';
import { ROUTES } from '@/lib/constants/routes';

function ArticlesContent(): React.ReactElement {
  const { data, isLoading } = useAdminArticles();
  const toggleMutation = useToggleArticlePublish();
  const articles = data?.items ?? [];

  if (isLoading) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="rounded-xl border border-border bg-card">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 border-b border-border last:border-0">
              <Skeleton className="h-5 flex-1" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-12" />
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-8">
      <h1 className="text-xl font-semibold text-foreground mb-6">სტატიები ({articles.length})</h1>

      {articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-muted-foreground">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
            </svg>
          </div>
          <p className="text-sm text-muted-foreground mb-3">სტატიები ჯერ არ არის.</p>
          <Button variant="outline" size="sm" asChild>
            <Link href={ROUTES.ADMIN.ARTICLES_NEW}>დაწერეთ პირველი სტატია</Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-x-auto bg-card">
          <Table className="min-w-[600px]">
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">სათაური <InfoTooltip text="სტატიის სათაური" /></TableHead>
                <TableHead className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">კატეგორია <InfoTooltip text="სტატიის კატეგორია" /></TableHead>
                <TableHead className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">კითხვა <InfoTooltip text="სავარაუდო კითხვის დრო წუთებში" /></TableHead>
                <TableHead className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">სტატუსი <InfoTooltip text="გამოქვეყნებული = ხილულია საიტზე, მონახაზი = მხოლოდ ადმინში" /></TableHead>
                <TableHead className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell className="px-3 py-2">
                    <span className="text-sm text-foreground font-medium">{article.title}</span>
                  </TableCell>
                  <TableCell className="px-3 py-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                      {article.category}
                    </span>
                  </TableCell>
                  <TableCell className="px-3 py-2">
                    <span className="text-sm text-muted-foreground tabular-nums">{article.readMin} წთ</span>
                  </TableCell>
                  <TableCell className="px-3 py-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      onClick={() => toggleMutation.mutate(article.id)}
                      disabled={toggleMutation.isPending}
                      className={`rounded-full whitespace-nowrap ${
                        article.isPublished
                          ? 'bg-success/10 text-success hover:bg-success/20'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {article.isPublished ? 'გამოქვეყნებული' : 'მონახაზი'}
                    </Button>
                  </TableCell>
                  <TableCell className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      <Link
                        href={ROUTES.ADMIN.ARTICLES_EDIT(article.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        aria-label="სტატიის რედაქტირება"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                      </Link>
                      <DeleteArticleButton articleId={article.id} articleTitle={article.title} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

export default function AdminArticlesPage(): React.ReactElement {
  return (
    <AdminGuard>
      <AdminHeader />
      <ArticlesContent />
    </AdminGuard>
  );
}
