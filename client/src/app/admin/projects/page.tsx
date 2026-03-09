'use client';

import { useState } from 'react';

import Link from 'next/link';

import { AdminGuard } from '@/features/admin/components/AdminGuard';
import { AdminHeader } from '@/features/admin/components/AdminHeader';
import { DeleteProjectButton } from '@/features/admin/components/DeleteProjectButton';
import { InfoTooltip } from '@/features/admin/components/InfoTooltip';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { useAdminProjects, useToggleProjectActive } from '@/features/projects/hooks/useProjects';
import { ROUTES } from '@/lib/constants/routes';

import type { ProjectType } from '@/features/projects/types/projects.types';

const TYPE_LABELS: Record<ProjectType, string> = {
  commercial: 'კომერციული',
  residential: 'საცხოვრებელი',
  retail: 'სავაჭრო',
  office: 'საოფისე',
};

function ProjectsContent(): React.ReactElement {
  const { data, isLoading } = useAdminProjects({ limit: 100 });
  const toggleMutation = useToggleProjectActive();
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const projects = data?.items ?? [];

  if (isLoading) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="rounded-xl border border-border bg-card">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 border-b border-border last:border-0">
              <Skeleton className="h-5 flex-1" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-12" />
              <Skeleton className="h-5 w-12" />
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-foreground">პროექტები ({projects.length})</h1>
        <Button asChild>
          <Link href={ROUTES.ADMIN.PROJECTS_NEW} className="flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            ახალი პროექტი
          </Link>
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-muted-foreground">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21m-3.75 3H21" />
            </svg>
          </div>
          <p className="text-sm text-muted-foreground mb-3">პროექტები ჯერ არ არის</p>
          <Button variant="outline" size="sm" asChild>
            <Link href={ROUTES.ADMIN.PROJECTS_NEW}>შექმენით პირველი პროექტი</Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-x-auto bg-card">
          <Table className="min-w-[600px]">
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">სათაური <InfoTooltip text="პროექტის სახელი" /></TableHead>
                <TableHead className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">ტიპი <InfoTooltip text="პროექტის ტიპი" /></TableHead>
                <TableHead className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">კამერები <InfoTooltip text="დამონტაჟებული კამერების რაოდენობა" /></TableHead>
                <TableHead className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">წელი <InfoTooltip text="მონტაჟის / დასრულების წელი" /></TableHead>
                <TableHead className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">სტატუსი <InfoTooltip text="აქტიური = ხილულია საიტზე, მონახაზი = მხოლოდ ადმინში" /></TableHead>
                <TableHead className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="px-3 py-2">
                    <span className="text-sm text-foreground font-medium">{project.title.ka}</span>
                  </TableCell>
                  <TableCell className="px-3 py-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                      {TYPE_LABELS[project.type]}
                    </span>
                  </TableCell>
                  <TableCell className="px-3 py-2">
                    <span className="text-sm text-muted-foreground tabular-nums">{project.cameras}</span>
                  </TableCell>
                  <TableCell className="px-3 py-2">
                    <span className="text-sm text-muted-foreground tabular-nums">{project.year}</span>
                  </TableCell>
                  <TableCell className="px-3 py-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      onClick={() => {
                        setTogglingId(project.id);
                        toggleMutation.mutate(
                          { id: project.id, currentIsActive: project.isActive },
                          { onSettled: () => setTogglingId(null) },
                        );
                      }}
                      disabled={togglingId === project.id}
                      className={`rounded-full whitespace-nowrap ${
                        project.isActive
                          ? 'bg-success/10 text-success hover:bg-success/20'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {project.isActive ? 'აქტიური' : 'მონახაზი'}
                    </Button>
                  </TableCell>
                  <TableCell className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      <Link
                        href={ROUTES.ADMIN.PROJECTS_EDIT(project.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        aria-label="პროექტის რედაქტირება"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                      </Link>
                      <DeleteProjectButton projectId={project.id} projectTitle={project.title.ka} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

export default function AdminProjectsPage(): React.ReactElement {
  return (
    <AdminGuard>
      <AdminHeader />
      <ProjectsContent />
    </AdminGuard>
  );
}
