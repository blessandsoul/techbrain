'use client';

import DOMPurify from 'isomorphic-dompurify';

const PURIFY_CONFIG = {
  ADD_TAGS: ['iframe'],
  ADD_ATTR: ['target', 'data-align', 'data-cols', 'data-layout', 'data-youtube-video', 'style', 'class', 'allowfullscreen', 'allow', 'frameborder'],
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
};

function sanitizeHtml(html: string): string {
  const clean = DOMPurify.sanitize(html, PURIFY_CONFIG);
  // Strip any iframe not pointing at YouTube embed
  return clean.replace(/<iframe[^>]*src="(?!https:\/\/www\.youtube\.com\/embed\/)[^"]*"[^>]*><\/iframe>/gi, '');
}

interface ProjectBodyProps {
  content: string;
}

export function ProjectBody({ content }: ProjectBodyProps): React.ReactElement | null {
  if (!content.trim()) return null;

  // Content is sanitized via DOMPurify before rendering to prevent XSS
  const sanitizedContent = sanitizeHtml(content);

  return (
    <div className="article-content max-w-[680px] mx-auto">
      <div className="prose prose-lg max-w-none
        prose-headings:text-foreground prose-headings:font-bold
        prose-h2:text-[22px] prose-h2:md:text-2xl prose-h2:mt-12 prose-h2:mb-4 prose-h2:leading-snug
        prose-h3:text-lg prose-h3:md:text-xl prose-h3:mt-10 prose-h3:mb-3 prose-h3:leading-snug
        prose-p:text-foreground/80 prose-p:leading-[1.8] prose-p:mb-7 prose-p:text-[17px]
        prose-strong:text-foreground
        prose-li:text-foreground/80 prose-li:leading-[1.8] prose-li:text-[17px]
        prose-a:text-primary prose-a:no-underline prose-a:border-b prose-a:border-primary/30 prose-a:transition-colors prose-a:duration-150 hover:prose-a:border-primary
        prose-blockquote:border-l-[3px] prose-blockquote:border-l-foreground/20 prose-blockquote:pl-5 prose-blockquote:py-0.5 prose-blockquote:not-italic prose-blockquote:text-foreground/70 prose-blockquote:text-[19px] prose-blockquote:leading-[1.7] prose-blockquote:font-normal
        prose-img:rounded-lg
        prose-hr:border-border/30 prose-hr:my-10
        prose-code:text-[15px] prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:font-normal prose-code:before:content-none prose-code:after:content-none
        dark:prose-invert
      ">
        <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
      </div>
    </div>
  );
}
