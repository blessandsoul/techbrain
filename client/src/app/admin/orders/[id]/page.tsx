'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminHeader } from '@/features/admin/components/AdminHeader';
import { InfoTooltip } from '@/features/admin/components/InfoTooltip';
import { useAdminOrder, useUpdateOrderStatus, useAddOrderNote } from '@/features/orders/hooks/useOrders';
import { statusColors, statusLabels, nextStatus, localeLabels } from '@/features/orders/constants/orders.constants';
import { ROUTES } from '@/lib/constants/routes';

import type { OrderStatus } from '@/features/orders/types/orders.types';

function OrderDetailSkeleton(): React.ReactElement {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
      <Skeleton className="h-4 w-24 mb-6" />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-7 w-24 rounded-full" />
          <Skeleton className="h-8 w-32" />
        </div>
      </div>
      <Skeleton className="h-32 w-full rounded-xl mb-4" />
      <Skeleton className="h-48 w-full rounded-xl" />
    </div>
  );
}

export default function OrderDetailPage(): React.ReactElement {
  const params = useParams<{ id: string }>();
  const { data: order, isLoading, isError, refetch } = useAdminOrder(params.id);
  const updateStatus = useUpdateOrderStatus();
  const addNote = useAddOrderNote();
  const [noteInput, setNoteInput] = useState('');

  const handleStatusChange = (newStatus: OrderStatus): void => {
    updateStatus.mutate({ id: params.id, status: newStatus });
  };

  if (isLoading) {
    return (
      <>
        <AdminHeader />
        <OrderDetailSkeleton />
      </>
    );
  }

  if (isError) {
    return (
      <>
        <AdminHeader />
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
          <Link
            href={ROUTES.ADMIN.ORDERS}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            შეკვეთები
          </Link>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-destructive mb-4">შეკვეთის ჩატვირთვა ვერ მოხერხდა.</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              ხელახლა ცდა
            </Button>
          </div>
        </div>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <AdminHeader />
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
          <p className="text-sm text-muted-foreground">შეკვეთა ვერ მოიძებნა.</p>
        </div>
      </>
    );
  }

  const formattedDate = new Date(order.createdAt).toLocaleString('ka-GE', {
    timeZone: 'Asia/Tbilisi',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <>
      <AdminHeader />
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
        <Link
          href={ROUTES.ADMIN.ORDERS}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          შეკვეთები
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              შეკვეთა #{order.id.slice(-6).toUpperCase()}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{formattedDate}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${statusColors[order.status]}`}>
              {statusLabels[order.status]}
            </span>
            {nextStatus[order.status] && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  const next = nextStatus[order.status];
                  if (next) handleStatusChange(next);
                }}
                disabled={updateStatus.isPending}
              >
                მონიშნე: {statusLabels[nextStatus[order.status]!]}
              </Button>
            )}
          </div>
        </div>

        {/* Customer info */}
        <div className="rounded-xl border border-border bg-card p-5 mb-4">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">მომხმარებელი <InfoTooltip text="შეკვეთის გამფორმებლის საკონტაქტო ინფორმაცია" /></h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">სახელი <InfoTooltip text="მომხმარებლის სახელი" /></p>
              <p className="text-sm font-medium text-foreground">{order.customerName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">ტელეფონი <InfoTooltip text="დააწკაპუნეთ ნომერზე WhatsApp-ში დასაკავშირებლად" /></p>
              <a
                href={`https://wa.me/${order.customerPhone.replace(/\D/g, '').replace(/^(?!995)/, '995')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-primary hover:underline tabular-nums"
              >
                {order.customerPhone}
              </a>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">ენა <InfoTooltip text="ენა რომელზეც მომხმარებელმა გააფორმა შეკვეთა" /></p>
              <p className="text-sm font-medium text-foreground">{localeLabels[order.locale] || order.locale}</p>
            </div>
          </div>
        </div>

        {/* Order items */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">ნივთები <InfoTooltip text="შეკვეთილი პროდუქტების სია რაოდენობით და ფასით" /></h2>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-sm text-foreground truncate">{item.productName}</span>
                  <span className="text-xs text-muted-foreground shrink-0">×{item.quantity}</span>
                </div>
                <span className="text-sm font-medium text-foreground tabular-nums shrink-0 ml-4">
                  {item.unitPrice * item.quantity} ₾
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-border mt-4 pt-4 flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">ჯამი</span>
            <span className="text-base font-bold text-foreground tabular-nums">{order.total} ₾</span>
          </div>
        </div>

        {/* Notes */}
        <div className="rounded-xl border border-border bg-card p-5 mt-4">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">შენიშვნები <InfoTooltip text="შიდა შენიშვნები ადმინისთრატორისთვის. მომხმარებელი ვერ ხედავს" /></h2>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="შენიშვნის დამატება..."
              className="flex-1 h-9 px-3 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && noteInput.trim()) {
                  addNote.mutate(
                    { orderId: params.id, content: noteInput.trim() },
                    { onSuccess: () => setNoteInput('') },
                  );
                }
              }}
            />
            <Button
              size="sm"
              variant="outline"
              disabled={!noteInput.trim() || addNote.isPending}
              onClick={() => {
                if (noteInput.trim()) {
                  addNote.mutate(
                    { orderId: params.id, content: noteInput.trim() },
                    { onSuccess: () => setNoteInput('') },
                  );
                }
              }}
            >
              {addNote.isPending ? '...' : 'დამატება'}
            </Button>
          </div>
          {order.notes && order.notes.length > 0 ? (
            <div className="space-y-2">
              {order.notes.map((note) => (
                <div key={note.id} className="flex items-start justify-between gap-3 text-sm p-2 rounded-lg bg-muted/50">
                  <p className="text-foreground">{note.content}</p>
                  <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
                    {new Date(note.createdAt).toLocaleString('ka-GE', { timeZone: 'Asia/Tbilisi', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">შენიშვნები ჯერ არ არის.</p>
          )}
        </div>
      </div>
    </>
  );
}
