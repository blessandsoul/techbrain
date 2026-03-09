'use client';

import { AdminGuard } from '@/features/admin/components/AdminGuard';
import { AdminHeader } from '@/features/admin/components/AdminHeader';
import { ProjectForm } from '@/features/admin/components/ProjectForm';

export default function NewProjectPage(): React.ReactElement {
  return (
    <AdminGuard>
      <AdminHeader />
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-8">
        <h1 className="text-xl font-semibold text-foreground mb-8">ახალი პროექტი</h1>
        <ProjectForm />
      </div>
    </AdminGuard>
  );
}
