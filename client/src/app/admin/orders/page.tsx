'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminHeader } from '@/features/admin/components/AdminHeader';
import { InfoTooltip } from '@/features/admin/components/InfoTooltip';
import { useAdminOrders, useDeleteOrder, useBulkUpdateOrderStatus } from '@/features/orders/hooks/useOrders';
import { statusColors, statusLabels } from '@/features/orders/constants/orders.constants';
import { useDebounce } from '@/hooks/useDebounce';
import { ROUTES } from '@/lib/constants/routes';

import type { IOrder, OrderStatus } from '@/features/orders/types/orders.types';

const ORDERS_PER_PAGE = 20;

function useUrlFilters(): {
  search: string;
  status: string;
  page: number;
  setParam: (key: string, value: string) => void;
} {
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = searchParams.get('search') ?? '';
  const status = searchParams.get('status') ?? 'all';
  const page = Number(searchParams.get('page') ?? '1');

  const setParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === 'all' || (key === 'page' && value === '1')) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    if (key !== 'page') {
      params.delete('page');
    }
    const qs = params.toString();
    router.push(qs ? `?${qs}` : '/admin/orders', { scroll: false });
  }, [router, searchParams]);

  return { search, status, page, setParam };
}

function OrderCardSkeleton(): React.ReactElement {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-28" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-40 rounded-md" />
            <Skeleton className="h-6 w-36 rounded-md" />
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-7 w-24 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function AdminOrdersPage(): React.ReactElement {
  const { search, status, page, setParam } = useUrlFilters();

  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebounce(searchInput, 400);
  const isUserTyping = useRef(false);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const deleteOrder = useDeleteOrder();
  const bulkUpdate = useBulkUpdateOrderStatus();

  useEffect(() => {
    if (isUserTyping.current) {
      setParam('search', debouncedSearch);
      isUserTyping.current = false;
    }
  }, [debouncedSearch, setParam]);

  // Sync URL search back to input when navigating
  useEffect(() => {
    if (!isUserTyping.current) {
      setSearchInput(search);
    }
  }, [search]);

  const filters = {
    page,
    limit: ORDERS_PER_PAGE,
    ...(status !== 'all' && { status: status as OrderStatus }),
    ...(search && { search }),
  };

  const { data, isLoading, isError } = useAdminOrders(filters);

  const orders = data?.items ?? [];
  const pagination = data?.pagination;
  const totalItems = pagination?.totalItems ?? 0;
  const totalPages = pagination?.totalPages ?? 1;
  const newCount = orders.filter((o: IOrder) => o.status === 'NEW').length;

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>): void {
    isUserTyping.current = true;
    setSearchInput(e.target.value);
  }

  function toggleSelect(id: string): void {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll(): void {
    if (selectedIds.size === orders.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(orders.map((o) => o.id)));
    }
  }

  function handleBulkStatus(newStatus: OrderStatus): void {
    bulkUpdate.mutate(
      { ids: Array.from(selectedIds), status: newStatus },
      { onSuccess: () => setSelectedIds(new Set()) },
    );
  }

  function handleDelete(id: string): void {
    deleteOrder.mutate(id, {
      onSuccess: () => setConfirmDeleteId(null),
    });
  }

  return (
    <>
      <AdminHeader />
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-xl font-semibold text-foreground">
            შეკვეთები ({totalItems})
            {newCount > 0 && <span className="ml-2 text-sm text-info">{newCount} ახალი</span>}
            <InfoTooltip text="საიტიდან შემოსული შეკვეთები. სტატუსები: New = ახალი, Contacted = დაკავშირებული, Completed = დასრულებული. დააწკაპუნეთ შეკვეთაზე დეტალებისთვის" />
          </h1>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              type="text"
              value={searchInput}
              onChange={handleSearchChange}
              placeholder="სახელით ძებნა..."
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setParam('status', e.target.value)}
            className="h-10 px-3 rounded-lg border border-input bg-background text-sm text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">ყველა სტატუსი</option>
            <option value="NEW">ახალი</option>
            <option value="CONTACTED">დაკავშირებული</option>
            <option value="COMPLETED">დასრულებული</option>
          </select>
        </div>

        {/* Bulk actions */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-muted/50 border border-border">
            <span className="text-sm text-muted-foreground">{selectedIds.size} არჩეული</span>
            <Button size="sm" variant="outline" onClick={() => handleBulkStatus('CONTACTED')} disabled={bulkUpdate.isPending}>
              &rarr; დაკავშირებული
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleBulkStatus('COMPLETED')} disabled={bulkUpdate.isPending}>
              &rarr; დასრულებული
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>
              გაუქმება
            </Button>
          </div>
        )}

        {isError ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-destructive">შეკვეთების ჩატვირთვა ვერ მოხერხდა.</p>
          </div>
        ) : isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <OrderCardSkeleton key={i} />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-muted-foreground">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
            <p className="text-sm text-muted-foreground">
              {search || status !== 'all' ? 'შეკვეთები ვერ მოიძებნა.' : 'შეკვეთები ჯერ არ არის.'}
            </p>
          </div>
        ) : (
          <>
            {/* Select all */}
            <div className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                checked={selectedIds.size === orders.length && orders.length > 0}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded border-border cursor-pointer accent-primary"
              />
              <span className="text-xs text-muted-foreground">ყველას მონიშვნა</span>
            </div>

            <div className="space-y-3">
              {orders.map((order: IOrder) => (
                <div key={order.id} className="relative rounded-xl border border-border bg-card p-4 transition-all duration-200 md:hover:shadow-md md:hover:border-border/80">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(order.id)}
                      onChange={() => toggleSelect(order.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1 w-4 h-4 rounded border-border cursor-pointer accent-primary shrink-0"
                    />
                    <Link
                      href={ROUTES.ADMIN.ORDER_DETAIL(order.id)}
                      className="flex-1 min-w-0"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
                            <span className="text-sm font-medium text-foreground">{order.customerName}</span>
                            <span className="text-sm text-muted-foreground tabular-nums">{order.customerPhone}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(order.createdAt).toLocaleString('ka-GE', { timeZone: 'Asia/Tbilisi', day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {order.items.map((item, i) => (
                              <span key={i} className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground">
                                {item.productName} x{item.quantity}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-sm font-bold text-foreground tabular-nums">{order.total} &#8382;</span>
                          <span className={`text-xs px-3 py-1.5 rounded-full ${statusColors[order.status]}`}>
                            {statusLabels[order.status]}
                          </span>
                        </div>
                      </div>
                    </Link>
                    {/* Delete button */}
                    {confirmDeleteId === order.id ? (
                      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(order.id)}
                          disabled={deleteOrder.isPending}
                          className="h-7 text-xs px-2"
                        >
                          წაშლა
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setConfirmDeleteId(null)}
                          className="h-7 text-xs px-2"
                        >
                          არა
                        </Button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); e.preventDefault(); setConfirmDeleteId(order.id); }}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                        title="წაშლა"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setParam('page', String(page - 1))}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </Button>
                <span className="text-sm text-muted-foreground tabular-nums">{page} / {totalPages}</span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setParam('page', String(page + 1))}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
