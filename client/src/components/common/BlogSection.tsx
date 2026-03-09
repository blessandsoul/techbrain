'use client';

import Link from 'next/link';
import { ArrowRight } from '@phosphor-icons/react/dist/ssr';
import { ArticleCard, ArticleCardSkeleton } from '@/components/common/ArticleCard';
import { useArticles } from '@/features/blog/hooks/useBlog';
import { useLocale } from '@/lib/i18n';

export function BlogSection(): React.ReactElement | null {
  const { data, isLoading } = useArticles({ limit: 3 });
  const { t } = useLocale();
  const articles = data?.items ?? [];

  if (!isLoading && articles.length === 0) return null;

  return (
    <section className="py-10 lg:py-14 bg-secondary/30 border-t border-border/40" aria-labelledby="blog-heading">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">

        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" aria-hidden="true" />
              {t('blog.badge')}
            </span>
            <h2 id="blog-heading" className="text-2xl md:text-3xl font-bold text-foreground">
              {t('blog.heading')}
            </h2>
          </div>
          <Link
            href="/blog"
            className="hidden md:flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-lg px-2 py-1"
          >
            {t('blog.viewAll')}
            <ArrowRight size={14} weight="bold" aria-hidden="true" />
          </Link>
        </div>

        {/* Posts grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => <ArticleCardSkeleton key={i} />)
            : articles.map((article, i) => (
                <ArticleCard key={article.id} article={article} priority={i === 0} />
              ))
          }
        </div>

        {/* Mobile — see all */}
        <div className="mt-8 flex justify-center md:hidden">
          <Link
            href="/blog"
            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-primary/30 text-primary text-sm font-semibold hover:bg-primary/5 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            {t('blog.viewAll')}
            <ArrowRight size={14} weight="bold" aria-hidden="true" />
          </Link>
        </div>

      </div>
    </section>
  );
}
