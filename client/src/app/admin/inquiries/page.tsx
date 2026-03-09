'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AdminHeader } from '@/features/admin/components/AdminHeader';
import { InfoTooltip } from '@/features/admin/components/InfoTooltip';
import { useAdminInquiries, useDeleteInquiry } from '@/features/inquiries/hooks/useInquiries';

import type { IInquiry } from '@/features/inquiries/types/inquiries.types';

function InquiryCardSkeleton(): React.ReactElement {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-28" />
          </div>
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
        <Skeleton className="h-7 w-16 rounded-full" />
      </div>
    </div>
  );
}

export default function AdminInquiriesPage(): React.ReactElement {
  const { data, isLoading, isError } = useAdminInquiries({ limit: 100 });
  const deleteInquiry = useDeleteInquiry();

  const inquiries = data?.items ?? [];

  return (
    <>
      <AdminHeader />
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-8">
        <h1 className="text-xl font-semibold text-foreground mb-6">
          მოთხოვნები ({inquiries.length})
          <InfoTooltip text="საკონტაქტო ფორმიდან შემოსული მოთხოვნები. ტელეფონზე დაწკაპება გახსნის WhatsApp-ს" />
        </h1>

        {isError ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-destructive">მოთხოვნების ჩატვირთვა ვერ მოხერხდა.</p>
          </div>
        ) : isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <InquiryCardSkeleton key={i} />
            ))}
          </div>
        ) : inquiries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-muted-foreground">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <p className="text-sm text-muted-foreground">მოთხოვნები ჯერ არ არის.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {inquiries.map((inquiry: IInquiry) => (
              <div key={inquiry.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
                      <span className="text-sm font-medium text-foreground">{inquiry.name}</span>
                      <a
                        href={`https://wa.me/995${inquiry.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline tabular-nums"
                      >
                        {inquiry.phone}
                      </a>
                      <span className="text-xs text-muted-foreground">
                        {new Date(inquiry.createdAt).toLocaleString('ru-RU', { timeZone: 'Asia/Tbilisi', day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{inquiry.message}</p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="rounded-full shrink-0"
                    disabled={deleteInquiry.isPending}
                    onClick={() => deleteInquiry.mutate(inquiry.id)}
                  >
                    წაშლა
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
