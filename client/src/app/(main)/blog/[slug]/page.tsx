'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, CalendarBlank } from '@phosphor-icons/react/dist/ssr';
import DOMPurify from 'isomorphic-dompurify';
import ReactMarkdown from 'react-markdown';
import { Skeleton } from '@/components/ui/skeleton';
import { BlogCoverImage } from '@/components/common/BlogCoverImage';
import { useArticle, getArticleImageUrl } from '@/features/blog/hooks/useBlog';
import { useLocale } from '@/lib/i18n';
import { getErrorMessage } from '@/lib/utils/error';

/** DOMPurify config — allows alignment attributes and styles from the editor */
const PURIFY_CONFIG = {
  ADD_ATTR: ['target', 'data-align', 'data-cols', 'data-layout', 'style', 'class'],
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
};

function isHtmlContent(content: string): boolean {
  return content.trimStart().startsWith('<');
}

function sanitizeHtml(html: string): string {
  // Content is sanitized via DOMPurify before rendering
  return DOMPurify.sanitize(html, PURIFY_CONFIG);
}

function ArticleDetailSkeleton(): React.ReactElement {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <Skeleton className="h-6 w-20 rounded-full mb-4" />
        <Skeleton className="h-10 w-full mb-2" />
        <Skeleton className="h-10 w-3/4 mb-4" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      <Skeleton className="h-64 md:h-96 w-full rounded-2xl mb-10" />
      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

export default function BlogPostPage(): React.ReactElement {
  const { t } = useLocale();
  const { slug } = useParams<{ slug: string }>();
  const { data: article, isLoading, error } = useArticle(slug);

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl py-12">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft size={16} weight="bold" />
        {t('blog.back')}
      </Link>

      {error ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-muted-foreground">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
            </svg>
          </div>
          <p className="text-sm text-muted-foreground mb-3">{t('blog.notFound')}</p>
          <Link
            href="/blog"
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            {t('blog.viewAll')}
          </Link>
        </div>
      ) : isLoading ? (
        <ArticleDetailSkeleton />
      ) : !article ? (
        <div className="text-center py-16 text-muted-foreground">
          {t('blog.notFound')}
        </div>
      ) : (
        <ArticleContent article={article} />
      )}
    </div>
  );
}

function ArticleContent({ article }: { article: NonNullable<ReturnType<typeof useArticle>['data']> }): React.ReactElement {
  const { t, dateLocale } = useLocale();

  const dateFormatted = new Intl.DateTimeFormat(dateLocale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(article.createdAt));

  // Sanitize HTML content via DOMPurify to prevent XSS
  const sanitizedContent = isHtmlContent(article.content)
    ? sanitizeHtml(article.content)
    : null;

  return (
    <article className="max-w-3xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 mb-4 inline-block">
          {article.category}
        </span>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight mb-4 text-balance">
          {article.title}
        </h1>
        <div className="flex items-center gap-4 text-muted-foreground text-sm">
          <div className="flex items-center gap-1.5">
            <CalendarBlank size={15} weight="regular" />
            <span>{dateFormatted}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={15} weight="regular" />
            <span>{article.readMin} {t('blog.min')}</span>
          </div>
        </div>
      </header>

      {/* Cover */}
      {article.coverImage && (
        <div className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden mb-10 bg-muted">
          <BlogCoverImage
            src={getArticleImageUrl(article.coverImage)}
            alt={article.title}
            priority
          />
        </div>
      )}

      {/* Article Content — HTML sanitized via DOMPurify, Markdown fallback for legacy */}
      <div className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-li:text-muted-foreground prose-a:text-primary prose-a:underline dark:prose-invert">
        {sanitizedContent ? (
          <div
            dangerouslySetInnerHTML={{
              __html: sanitizedContent,
            }}
          />
        ) : (
          <ReactMarkdown
            components={{
              h1: ({ children }) => <h2 className="text-2xl font-bold mt-8 mb-4">{children}</h2>,
              a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>,
            }}
          >
            {article.content}
          </ReactMarkdown>
        )}
      </div>
    </article>
  );
}
