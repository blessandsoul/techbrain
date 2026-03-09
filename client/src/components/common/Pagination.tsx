'use client';

import type React from 'react';
import { useCallback } from 'react';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useLocale } from '@/lib/i18n';

interface PaginationProps {
  page: number;
  totalPages: number;
}

export const Pagination = ({ page, totalPages }: PaginationProps): React.ReactElement => {
  const { t } = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createPageUrl = useCallback(
    (pageNumber: number): string => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', pageNumber.toString());
      return `${pathname}?${params.toString()}`;
    },
    [pathname, searchParams]
  );

  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.push(createPageUrl(page - 1))}
        disabled={page <= 1}
        aria-label={t('catalog.prevPage')}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm tabular-nums text-muted-foreground">
        {t('catalog.page', { page, totalPages })}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.push(createPageUrl(page + 1))}
        disabled={page >= totalPages}
        aria-label={t('catalog.nextPage')}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
