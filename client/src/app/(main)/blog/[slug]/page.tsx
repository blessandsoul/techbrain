'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useArticle } from '@/features/blog/hooks/useBlog';
import { useLocale } from '@/lib/i18n';
import { ReadingProgress } from './_components/ReadingProgress';
import { ArticleHero } from './_components/ArticleHero';
import { ArticleBody } from './_components/ArticleBody';
import { ArticleFooter } from './_components/ArticleFooter';
import { RelatedArticles } from './_components/RelatedArticles';
import { ArticleDetailSkeleton } from './_components/ArticleDetailSkeleton';

export default function BlogPostPage(): React.ReactElement {
  const { t } = useLocale();
  const { slug } = useParams<{ slug: string }>();
  const { data: article, isLoading, error } = useArticle(slug);

  return (
    <>
      {article && <ReadingProgress />}

      <div className="mx-auto px-4 md:px-8 lg:px-12 max-w-5xl pb-12 md:pb-20">
        {error ? (
          <ErrorState />
        ) : isLoading ? (
          <ArticleDetailSkeleton />
        ) : !article ? (
          <div className="text-center py-16 text-muted-foreground">
            {t('blog.notFound')}
          </div>
        ) : (
          <article>
            <ArticleHero article={article} />
            <ArticleBody content={article.content} />
            <ArticleFooter title={article.title} />
            <RelatedArticles currentSlug={slug} category={article.category} />
          </article>
        )}
      </div>
    </>
  );
}

function ErrorState(): React.ReactElement {
  const { t } = useLocale();

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-muted-foreground">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
        </svg>
      </div>
      <p className="text-sm text-muted-foreground mb-3">{t('blog.notFound')}</p>
      <Link
        href="/blog"
        className="text-sm text-primary active:opacity-70 md:hover:text-primary/80 transition-colors"
      >
        {t('blog.viewAll')}
      </Link>
    </div>
  );
}
