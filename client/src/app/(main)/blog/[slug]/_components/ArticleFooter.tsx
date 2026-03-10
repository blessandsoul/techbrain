'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShareNetwork, LinkSimple } from '@phosphor-icons/react/dist/ssr';
import { toast } from 'sonner';
import { useLocale } from '@/lib/i18n';

interface ArticleFooterProps {
  title: string;
}

export function ArticleFooter({ title }: ArticleFooterProps): React.ReactElement {
  const { t } = useLocale();

  const handleCopyLink = useCallback(async (): Promise<void> => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        /* user cancelled share dialog */
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success(t('blog.linkCopied'));
    }
  }, [title, t]);

  return (
    <div className="max-w-[680px] mx-auto mt-14 md:mt-20">
      {/* Subtle divider */}
      <div className="w-12 h-px bg-border mx-auto mb-10" />

      {/* Share actions */}
      <div className="flex items-center justify-center gap-3 mb-10">
        <button
          type="button"
          onClick={handleCopyLink}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-border bg-card text-sm text-muted-foreground transition-colors active:scale-[0.97] md:hover:text-foreground md:hover:border-foreground/20"
        >
          <LinkSimple size={16} weight="bold" />
          {t('blog.share')}
        </button>
      </div>

      {/* Back to blog */}
      <div className="text-center">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors active:opacity-70 md:hover:text-foreground"
        >
          <ArrowLeft size={14} weight="bold" />
          {t('blog.back')}
        </Link>
      </div>
    </div>
  );
}
