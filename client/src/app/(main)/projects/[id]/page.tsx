'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, CalendarBlank, SecurityCamera, Buildings, House, Storefront } from '@phosphor-icons/react';
import { SafeImage } from '@/components/common/SafeImage';
import { useProject, getProjectImageUrl } from '@/features/projects/hooks/useProjects';
import { ROUTES } from '@/lib/constants/routes';
import { useLocale } from '@/lib/i18n';

import type { ProjectType } from '@/features/projects/types/projects.types';

const TYPE_ICONS: Record<ProjectType, typeof Buildings> = {
  commercial: Buildings,
  residential: House,
  retail: Storefront,
  office: Buildings,
};

export default function ProjectDetailPage(): React.ReactElement {
  const { t, localized } = useLocale();
  const params = useParams<{ id: string }>();
  const { data: project, isLoading } = useProject(params.id);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl py-12">
        <div className="h-4 w-24 bg-muted animate-pulse rounded mb-8" />
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 space-y-4">
            <div className="h-6 w-20 bg-muted animate-pulse rounded-full" />
            <div className="h-10 w-3/4 bg-muted animate-pulse rounded" />
            <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-64 md:h-[28rem] bg-muted animate-pulse rounded-2xl mb-10" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-5 rounded-xl border border-border/50 bg-card space-y-3">
                <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                <div className="h-5 w-20 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 max-w-7xl py-24 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-muted-foreground">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
        </div>
        <h1 className="text-lg font-semibold text-foreground mb-2">{t('projects.notFound')}</h1>
        <p className="text-sm text-muted-foreground mb-6">{t('projects.notFoundDesc')}</p>
        <Link
          href={ROUTES.PROJECTS}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          <ArrowLeft size={16} weight="bold" />
          {t('projects.backToProjects')}
        </Link>
      </div>
    );
  }

  const title = localized(project.title);
  const location = localized(project.location);
  const Icon = TYPE_ICONS[project.type];
  const typeLabel = t(`projects.type.${project.type}` as keyof typeof import('@/lib/i18n/locales/ka.json'));

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl py-12">
      <Link
        href={ROUTES.PROJECTS}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft size={16} weight="bold" />
        {t('nav.projects')}
      </Link>

      <article className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
              <Icon size={13} weight="duotone" aria-hidden="true" />
              {typeLabel}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight mb-4 text-balance">
            {title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
            <div className="flex items-center gap-1.5">
              <MapPin size={15} weight="fill" />
              <span>{location}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CalendarBlank size={15} weight="regular" />
              <span className="tabular-nums">{project.year}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <SecurityCamera size={15} weight="duotone" />
              <span className="tabular-nums">{project.cameras} {t('projects.installedCameras')}</span>
            </div>
          </div>
        </header>

        {/* Cover image */}
        {project.image && (
          <div className="relative w-full h-64 md:h-[28rem] rounded-2xl overflow-hidden mb-10 bg-muted">
            <SafeImage
              src={getProjectImageUrl(project.image)}
              alt={title}
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 896px"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none"
              aria-hidden="true"
            />
          </div>
        )}

        {/* Info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl border border-border/50 bg-card">
            <div className="text-xs text-muted-foreground uppercase tracking-widest mb-2">{t('projects.projectType')}</div>
            <div className="flex items-center gap-2">
              <Icon size={18} weight="duotone" className="text-primary" aria-hidden="true" />
              <span className="text-base font-bold text-foreground">{typeLabel}</span>
            </div>
          </div>
          <div className="p-5 rounded-xl border border-border/50 bg-card">
            <div className="text-xs text-muted-foreground uppercase tracking-widest mb-2">{t('projects.location')}</div>
            <div className="flex items-center gap-2">
              <MapPin size={18} weight="fill" className="text-primary" aria-hidden="true" />
              <span className="text-base font-bold text-foreground">{location}</span>
            </div>
          </div>
          <div className="p-5 rounded-xl border border-border/50 bg-card">
            <div className="text-xs text-muted-foreground uppercase tracking-widest mb-2">{t('projects.installedCameras')}</div>
            <div className="flex items-center gap-2">
              <SecurityCamera size={18} weight="duotone" className="text-primary" aria-hidden="true" />
              <span className="text-base font-bold text-foreground tabular-nums">{project.cameras}</span>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
