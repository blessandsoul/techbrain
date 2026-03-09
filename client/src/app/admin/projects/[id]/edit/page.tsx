'use client';

import { use } from 'react';

import { AdminGuard } from '@/features/admin/components/AdminGuard';
import { AdminHeader } from '@/features/admin/components/AdminHeader';
import { ProjectForm } from '@/features/admin/components/ProjectForm';
import { Skeleton } from '@/components/ui/skeleton';
import { useProject } from '@/features/projects/hooks/useProjects';

interface EditProjectPageProps {
  params: Promise<{ id: string }>;
}

function EditProjectContent({ id }: { id: string }): React.ReactElement {
  const { data: project, isLoading, error } = useProject(id);

  if (isLoading) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-8">
        <Skeleton className="h-8 w-64 mb-8" />
        <Skeleton className="h-96 max-w-2xl rounded-xl" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-8">
        <p className="text-sm text-destructive">პროექტი ვერ მოიძებნა</p>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-8">
      <h1 className="text-xl font-semibold text-foreground mb-8">პროექტის რედაქტირება</h1>
      <ProjectForm project={project} />
    </div>
  );
}

export default function EditProjectPage({ params }: EditProjectPageProps): React.ReactElement {
  const { id } = use(params);

  return (
    <AdminGuard>
      <AdminHeader />
      <EditProjectContent id={id} />
    </AdminGuard>
  );
}
