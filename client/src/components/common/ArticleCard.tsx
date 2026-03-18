'use client';

import Link from 'next/link';
import { ArrowRight, Clock } from '@phosphor-icons/react/dist/ssr';
import { SafeImage } from '@/components/common/SafeImage';
import { Skeleton } from '@/components/ui/skeleton';
import { getArticleImageUrl } from '@/features/blog/hooks/useBlog';
import { useLocale } from '@/lib/i18n';

import type { Article } from '@/features/blog/types/article.types';

// ── Helpers ──

function formatDate(dateString: string, dateLocale: string): string {
  return new Intl.DateTimeFormat(dateLocale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateString));
}

// ── Sub-components ──

function ImagePlaceholder(): React.ReactElement {
  return (
    <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-muted to-muted flex items-center justify-center">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-border" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
        <path d="M3 15l5-5 4 4 3-3 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

// ── Article Card ──

interface ArticleCardProps {
  article: Article;
  priority?: boolean;
}

export function ArticleCard({ article, priority = false }: ArticleCardProps): React.ReactElement {
  const { t, dateLocale } = useLocale();

  return (
    <Link href={`/blog/${article.slug}`} className="group block h-full">
      <article className="flex flex-col h-full rounded-xl overflow-hidden border border-border/50 bg-card transition-all duration-300 active:scale-[0.98] md:hover:-translate-y-1 md:hover:border-primary/20 md:hover:shadow-lg">
        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden bg-muted shrink-0">
          {article.coverImage ? (
            <SafeImage
              src={getArticleImageUrl(article.coverImage, article.updatedAt)}
              alt={article.title}
              priority={priority}
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <ImagePlaceholder />
          )}
          <div
            className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent pointer-events-none"
            aria-hidden="true"
          />
          {/* Category badge on image */}
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-background/90 backdrop-blur-sm border border-border/60 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <span className="w-1 h-1 rounded-full bg-primary" aria-hidden="true" />
              {article.category}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col flex-1 p-5 gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{formatDate(article.createdAt, dateLocale)}</span>
            <span className="w-0.5 h-0.5 rounded-full bg-border" aria-hidden="true" />
            <div className="flex items-center gap-1">
              <Clock size={13} weight="regular" aria-hidden="true" />
              <span>{article.readMin} {t('blog.min')}</span>
            </div>
          </div>

          <h3 className="text-base font-bold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-200">
            {article.title}
          </h3>

          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 flex-1">
            {article.excerpt}
          </p>

          <div className="pt-1 mt-auto">
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:gap-2 transition-all duration-200">
              {t('blog.read')}
              <ArrowRight size={12} weight="bold" aria-hidden="true" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

// ── Skeleton ──

export function ArticleCardSkeleton(): React.ReactElement {
  return (
    <div className="flex flex-col rounded-xl overflow-hidden border border-border/50 bg-card h-full">
      <Skeleton className="aspect-[16/10] w-full rounded-none" />
      <div className="flex flex-col flex-1 p-5 gap-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-3.5 w-14" />
        </div>
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}
