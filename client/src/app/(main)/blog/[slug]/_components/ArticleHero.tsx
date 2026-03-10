'use client';

import { Clock } from '@phosphor-icons/react/dist/ssr';
import { BlogCoverImage } from '@/components/common/BlogCoverImage';
import { getArticleImageUrl } from '@/features/blog/hooks/useBlog';
import { useLocale } from '@/lib/i18n';

import type { Article } from '@/features/blog/types/article.types';

interface ArticleHeroProps {
  article: Article;
}

export function ArticleHero({ article }: ArticleHeroProps): React.ReactElement {
  const { t, dateLocale } = useLocale();

  const dateFormatted = new Intl.DateTimeFormat(dateLocale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(article.createdAt));

  return (
    <div className="mb-10 md:mb-14">
      {/* Header — centered, text-first like Vercel/Medium */}
      <header className="text-center max-w-3xl mx-auto pt-4 md:pt-8 mb-8 md:mb-12">
        {/* Category as breadcrumb */}
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4 md:mb-6">
          {t('blog.back')} / {article.category}
        </p>

        {/* Dominant title */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-[1.15] tracking-tight text-balance mb-5 md:mb-6">
          {article.title}
        </h1>

        {/* Excerpt as subtitle */}
        {article.excerpt && (
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-6 md:mb-8">
            {article.excerpt}
          </p>
        )}

        {/* Metadata row */}
        <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
          <span>{dateFormatted}</span>
          <span className="w-1 h-1 rounded-full bg-border" aria-hidden="true" />
          <div className="flex items-center gap-1.5">
            <Clock size={14} weight="regular" />
            <span>{article.readMin} {t('blog.min')}</span>
          </div>
        </div>
      </header>

      {/* Cover Image — full container width, rounded on desktop */}
      {article.coverImage && (
        <div className="relative w-full aspect-[2/1] md:aspect-[21/9] rounded-xl md:rounded-2xl overflow-hidden bg-muted">
          <BlogCoverImage
            src={getArticleImageUrl(article.coverImage)}
            alt={article.title}
            priority
            sizes="(max-width: 768px) 100vw, 1024px"
          />
        </div>
      )}
    </div>
  );
}
