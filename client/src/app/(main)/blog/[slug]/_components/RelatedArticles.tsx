'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight } from '@phosphor-icons/react';
import { ArticleCard, ArticleCardSkeleton } from '@/components/common/ArticleCard';
import { useArticles } from '@/features/blog/hooks/useBlog';
import { useLocale } from '@/lib/i18n';

import type { Article } from '@/features/blog/types/article.types';

interface RelatedArticlesProps {
  currentSlug: string;
  category: string;
}

const DISPLAY_COUNT = 8;

export function RelatedArticles({ currentSlug, category }: RelatedArticlesProps): React.ReactElement | null {
  const { t } = useLocale();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Fetch same-category articles
  const { data: sameCategoryData, isLoading: loadingSame } = useArticles({
    category,
    limit: DISPLAY_COUNT + 1, // +1 because we exclude the current article
  });

  // Fetch recent articles as fallback
  const { data: recentData, isLoading: loadingRecent } = useArticles({
    limit: DISPLAY_COUNT + 1,
  });

  // Build the final list: same category first, fill remaining with recent
  const articles = buildArticleList(
    sameCategoryData?.items,
    recentData?.items,
    currentSlug,
  );

  const isLoading = loadingSame || loadingRecent;

  const updateScrollButtons = useCallback((): void => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollButtons();
    el.addEventListener('scroll', updateScrollButtons, { passive: true });
    window.addEventListener('resize', updateScrollButtons);
    return (): void => {
      el.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, [updateScrollButtons, articles]);

  const scroll = useCallback((direction: 'left' | 'right'): void => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector('[data-card]')?.clientWidth ?? 300;
    const gap = 16;
    el.scrollBy({
      left: direction === 'left' ? -(cardWidth + gap) : cardWidth + gap,
      behavior: 'smooth',
    });
  }, []);

  // Don't render if no articles at all (not even loading)
  if (!isLoading && articles.length === 0) return null;

  return (
    <section className="mt-16 md:mt-24">
      {/* Divider */}
      <div className="w-12 h-px bg-border mx-auto mb-10 md:mb-14" />

      {/* Header with arrows */}
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <h2 className="text-lg md:text-xl font-bold text-foreground">
          {t('blog.relatedArticles')}
        </h2>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
            className="p-2 rounded-full border border-border bg-card text-muted-foreground transition-all active:scale-95 md:hover:text-foreground md:hover:border-foreground/20 disabled:opacity-30 disabled:pointer-events-none"
          >
            <ArrowLeft size={16} weight="bold" />
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            aria-label="Scroll right"
            className="p-2 rounded-full border border-border bg-card text-muted-foreground transition-all active:scale-95 md:hover:text-foreground md:hover:border-foreground/20 disabled:opacity-30 disabled:pointer-events-none"
          >
            <ArrowRight size={16} weight="bold" />
          </button>
        </div>
      </div>

      {/* Scrollable card row */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 -mx-4 px-4 md:-mx-0 md:px-0"
      >
        {isLoading
          ? Array.from({ length: DISPLAY_COUNT }).map((_, i) => (
              <div
                key={i}
                className="w-[280px] md:w-[calc(25%-12px)] shrink-0 snap-start"
                data-card
              >
                <ArticleCardSkeleton />
              </div>
            ))
          : articles.map((article) => (
              <div
                key={article.id}
                className="w-[280px] md:w-[calc(25%-12px)] shrink-0 snap-start"
                data-card
              >
                <ArticleCard article={article} />
              </div>
            ))}
      </div>
    </section>
  );
}

/** Build a deduped list: same-category articles first, pad with recent ones */
function buildArticleList(
  sameCategoryItems: Article[] | undefined,
  recentItems: Article[] | undefined,
  excludeSlug: string,
): Article[] {
  const seen = new Set<string>([excludeSlug]);
  const result: Article[] = [];

  // Add same-category articles first
  for (const article of sameCategoryItems ?? []) {
    if (seen.has(article.slug)) continue;
    seen.add(article.slug);
    result.push(article);
    if (result.length >= DISPLAY_COUNT) return result;
  }

  // Fill remaining slots with recent articles
  for (const article of recentItems ?? []) {
    if (seen.has(article.slug)) continue;
    seen.add(article.slug);
    result.push(article);
    if (result.length >= DISPLAY_COUNT) return result;
  }

  return result;
}
