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

  const handlePageChange = useCallback(
    (pageNumber: number): void => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', pageNumber.toString());
      const url = `${pathname}?${params.toString()}`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        router.push(url);
      }, 400);
    },
    [pathname, searchParams, router]
  );

  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(page - 1)}
        disabled={page <= 1}
        aria-label={t('catalog.prevPage')}
        className="cursor-pointer"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm tabular-nums text-muted-foreground">
        {t('catalog.page', { page, totalPages })}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label={t('catalog.nextPage')}
        className="cursor-pointer"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
