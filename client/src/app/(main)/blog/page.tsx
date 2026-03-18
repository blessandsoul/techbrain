'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft } from '@phosphor-icons/react/dist/ssr';
import { ArticleCard, ArticleCardSkeleton } from '@/components/common/ArticleCard';
import { Pagination } from '@/components/common/Pagination';
import { useArticles } from '@/features/blog/hooks/useBlog';
import { useLocale } from '@/lib/i18n';
import { getErrorMessage } from '@/lib/utils/error';

export default function BlogPage(): React.ReactElement {
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;

  const { data, isLoading, error } = useArticles({ page, limit: 12 });
  const articles = data?.items ?? [];
  const pagination = data?.pagination;

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl py-12">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft size={16} weight="bold" />
        {t('nav.home')}
      </Link>

      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-10">
        {t('blog.heading')}
      </h1>

      {error ? (
        <div className="text-center py-16 text-destructive">
          {getErrorMessage(error)}
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <ArticleCardSkeleton key={i} />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          {t('blog.noArticles')}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, i) => (
              <ArticleCard key={article.id} article={article} priority={i < 3} />
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-10">
              <Pagination page={pagination.page} totalPages={pagination.totalPages} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
