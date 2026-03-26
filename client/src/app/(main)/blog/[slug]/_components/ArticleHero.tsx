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
      {/* Category as breadcrumb */}
      <p className="text-center text-xs font-medium uppercase tracking-widest text-muted-foreground pt-4 md:pt-8 mb-4 md:mb-6">
        {t('blog.back')} / {article.category}
      </p>

      {/* Title — uppercase via CSS (preserves Georgian script) */}
      <h1 className="text-center text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-[1.15] tracking-tight text-balance max-w-3xl mx-auto mb-6 md:mb-8 uppercase">
        {article.title}
      </h1>

      {/* Metadata row */}
      <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground mb-8 md:mb-10">
        <span>{dateFormatted}</span>
        <span className="w-1 h-1 rounded-full bg-border" aria-hidden="true" />
        <div className="flex items-center gap-1.5">
          <Clock size={14} weight="regular" />
          <span>{article.readMin} {t('blog.min')}</span>
        </div>
      </div>

      {/* Cover Image — 1:1 (800x800) */}
      {article.coverImage && (
        <div className="relative w-full max-w-[600px] mx-auto aspect-square rounded-xl md:rounded-2xl overflow-hidden bg-muted mb-8 md:mb-10">
          <BlogCoverImage
            src={getArticleImageUrl(article.coverImage, article.updatedAt)}
            alt={article.title}
            priority
            sizes="(max-width: 768px) 100vw, 600px"
          />
        </div>
      )}

      {/* Video */}
      {article.videoUrl && (
        <div className="relative w-full max-w-[600px] mx-auto aspect-square rounded-xl md:rounded-2xl overflow-hidden bg-black mb-8 md:mb-10">
          <video
            key={article.videoUrl}
            poster={article.coverImage ? getArticleImageUrl(article.coverImage, article.updatedAt) : undefined}
            autoPlay
            muted
            loop
            playsInline
            controls
            preload="metadata"
            className="absolute inset-0 w-full h-full object-contain"
          >
            <source src={getArticleImageUrl(article.videoUrl, article.updatedAt)} />
          </video>
        </div>
      )}

      {/* Description / Excerpt — after cover */}
      {article.excerpt && (
        <p className="text-center text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          {article.excerpt}
        </p>
      )}
    </div>
  );
}
