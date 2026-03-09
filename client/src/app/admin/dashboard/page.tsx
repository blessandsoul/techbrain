'use client';

import { Suspense } from 'react';

import Link from 'next/link';

import { AdminGuard } from '@/features/admin/components/AdminGuard';
import { AdminHeader } from '@/features/admin/components/AdminHeader';
import { ProductTable } from '@/features/admin/components/ProductTable';
import { InfoTooltip } from '@/features/admin/components/InfoTooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminDashboardStats } from '@/features/admin/hooks/useAdminProducts';

import type { DashboardStats } from '@/features/admin/types/admin.types';

function StatsCards({ stats }: { stats?: DashboardStats }): React.ReactElement {
  const cards = [
    {
      label: 'პროდუქტები',
      value: stats ? `${stats.products.active}/${stats.products.total}` : '—',
      sub: 'აქტიური',
      href: '/admin/dashboard',
      tip: 'აქტიური / საერთო პროდუქტების რაოდენობა',
    },
    {
      label: 'სტატიები',
      value: stats ? `${stats.articles.published}/${stats.articles.total}` : '—',
      sub: 'გამოქვეყნებული',
      href: '/admin/dashboard',
      tip: 'გამოქვეყნებული / საერთო სტატიების რაოდენობა',
    },
    {
      label: 'შეკვეთები',
      value: stats ? String(stats.orders.total) : '—',
      sub: 'სულ',
      href: '/admin/dashboard',
      tip: 'შეკვეთების რაოდენობა',
    },
    {
      label: 'შემოსავალი',
      value: stats ? `${stats.revenue} ₾` : '— ₾',
      sub: 'დასრულებული',
      href: '/admin/dashboard',
      tip: 'შემოსავალი დასრულებული შეკვეთებიდან',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((s) => (
        <Link
          key={s.label}
          href={s.href}
          className="rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
        >
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
            {s.label} <InfoTooltip text={s.tip} />
          </p>
          <p className="text-2xl font-bold text-foreground tabular-nums leading-none">{s.value}</p>
          <p className="text-xs mt-1.5 text-muted-foreground">{s.sub}</p>
        </Link>
      ))}
    </div>
  );
}

function DashboardContent(): React.ReactElement {
  const { data: stats } = useAdminDashboardStats();

  return (
    <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-8">
      <StatsCards stats={stats} />

      <h2 className="text-xl font-semibold text-foreground mb-4">
        პროდუქტები ({stats?.products.total ?? 0})
      </h2>

      <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
        <ProductTable />
      </Suspense>
    </div>
  );
}

export default function AdminDashboardPage(): React.ReactElement {
  return (
    <AdminGuard>
      <AdminHeader />
      <DashboardContent />
    </AdminGuard>
  );
}
