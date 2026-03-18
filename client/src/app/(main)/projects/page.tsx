'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, MapPin, SecurityCamera, Buildings, House, Storefront } from '@phosphor-icons/react';
import { SafeImage } from '@/components/common/SafeImage';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination } from '@/components/common/Pagination';
import { useActiveProjects, getProjectImageUrl } from '@/features/projects/hooks/useProjects';
import { ROUTES } from '@/lib/constants/routes';
import { useLocale } from '@/lib/i18n';

import type { ProjectType } from '@/features/projects/types/projects.types';

const TYPE_ICONS: Record<ProjectType, typeof Buildings> = {
  commercial: Buildings,
  residential: House,
  retail: Storefront,
  office: Buildings,
};

function ProjectCardSkeleton(): React.ReactElement {
  return (
    <div className="flex flex-col rounded-xl overflow-hidden border border-border/50 bg-card h-full">
      <Skeleton className="aspect-[16/10] w-full rounded-none" />
      <div className="flex flex-col flex-1 p-5 gap-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3.5 w-20" />
        </div>
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-3.5 w-1/2" />
      </div>
    </div>
  );
}

export default function ProjectsPage(): React.ReactElement {
  const { t, localized } = useLocale();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;

  const { data, isLoading } = useActiveProjects({ page, limit: 10 });
  const projects = data?.items ?? [];
  const pagination = data?.pagination;

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl py-12">
      <Link
        href={ROUTES.HOME}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft size={16} weight="bold" />
        {t('nav.home')}
      </Link>

      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-10">{t('projects.heading')}</h1>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          {t('projects.noProjects')}
        </div>
      ) : (
        <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, i) => {
            const title = localized(project.title);
            const location = localized(project.location);
            const Icon = TYPE_ICONS[project.type];
            const typeLabel = t(`projects.type.${project.type}` as keyof typeof import('@/lib/i18n/locales/ka.json'));

            return (
              <Link key={project.id} href={ROUTES.PROJECT_DETAIL(project.slug)} className="group block">
                <article className="flex flex-col rounded-xl overflow-hidden border border-border/50 bg-card transition-all duration-300 active:scale-[0.98] md:hover:-translate-y-1 md:hover:border-primary/20 md:hover:shadow-lg h-full">
                  {/* Image */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-muted shrink-0">
                    {project.image ? (
                      <SafeImage
                        src={getProjectImageUrl(project.image, project.updatedAt)}
                        alt={title}
                        priority={i < 3}
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-muted to-muted flex items-center justify-center">
                        <SecurityCamera size={48} weight="duotone" className="text-border" aria-hidden="true" />
                      </div>
                    )}
                    <div
                      className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent pointer-events-none"
                      aria-hidden="true"
                    />

                    {/* Year badge */}
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-background/90 backdrop-blur-sm border border-border/60 text-[10px] font-bold tabular-nums text-muted-foreground">
                        <span className="w-1 h-1 rounded-full bg-primary" aria-hidden="true" />
                        {project.year}
                      </span>
                    </div>

                    {/* Cameras count */}
                    <div className="absolute bottom-3 left-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-background/90 backdrop-blur-sm border border-border/60 text-[10px] font-bold text-foreground">
                        <span className="relative flex h-1.5 w-1.5 shrink-0" aria-hidden="true">
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-online" />
                        </span>
                        <span className="tabular-nums">{project.cameras}</span>
                        <span className="text-muted-foreground font-semibold">{t('projects.camera')}</span>
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="flex flex-col flex-1 p-5 gap-2">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Icon size={13} weight="duotone" className="text-primary shrink-0" aria-hidden="true" />
                      <span className="text-xs font-bold uppercase tracking-[0.12em]">{typeLabel}</span>
                    </div>

                    <h3 className="text-base font-bold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-200">
                      {title}
                    </h3>

                    <div className="flex items-center gap-1 text-muted-foreground mt-auto">
                      <MapPin size={13} weight="fill" className="shrink-0" aria-hidden="true" />
                      <span className="text-xs truncate">{location}</span>
                    </div>

                    <div className="pt-1 mt-auto">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:gap-2 transition-all duration-200">
                        {t('projects.view')}
                        <ArrowRight size={12} weight="bold" aria-hidden="true" />
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-10">
              <Pagination page={pagination.page} totalPages={pagination.totalPages} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
