'use client';

import { MapPin, CalendarBlank, SecurityCamera, Buildings, House, Storefront } from '@phosphor-icons/react/dist/ssr';
import { SafeImage } from '@/components/common/SafeImage';
import { getProjectImageUrl } from '@/features/projects/hooks/useProjects';
import { useLocale } from '@/lib/i18n';

import type { IProject, ProjectType } from '@/features/projects/types/projects.types';

const TYPE_ICONS: Record<ProjectType, typeof Buildings> = {
  commercial: Buildings,
  residential: House,
  retail: Storefront,
  office: Buildings,
};

interface ProjectHeroProps {
  project: IProject;
}

export function ProjectHero({ project }: ProjectHeroProps): React.ReactElement {
  const { t, localized } = useLocale();

  const title = localized(project.title);
  const location = localized(project.location);
  const excerpt = localized(project.excerpt);
  const Icon = TYPE_ICONS[project.type];
  const typeLabel = t(`projects.type.${project.type}` as keyof typeof import('@/lib/i18n/locales/ka.json'));

  return (
    <div className="mb-10 md:mb-14">
      {/* Header — centered */}
      <header className="text-center max-w-3xl mx-auto pt-4 md:pt-8 mb-8 md:mb-12">
        {/* Type breadcrumb */}
        <div className="flex items-center justify-center gap-2 mb-4 md:mb-6">
          <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
            <Icon size={13} weight="duotone" aria-hidden="true" />
            {typeLabel}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-[1.15] tracking-tight text-balance mb-5 md:mb-6">
          {title}
        </h1>

        {/* Excerpt */}
        {excerpt && (
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-6 md:mb-8">
            {excerpt}
          </p>
        )}

        {/* Metadata row */}
        <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground flex-wrap">
          <div className="flex items-center gap-1.5">
            <MapPin size={14} weight="fill" />
            <span>{location}</span>
          </div>
          <span className="w-1 h-1 rounded-full bg-border" aria-hidden="true" />
          <div className="flex items-center gap-1.5">
            <CalendarBlank size={14} weight="regular" />
            <span className="tabular-nums">{project.year}</span>
          </div>
          <span className="w-1 h-1 rounded-full bg-border" aria-hidden="true" />
          <div className="flex items-center gap-1.5">
            <SecurityCamera size={14} weight="duotone" />
            <span className="tabular-nums">{project.cameras} {t('projects.installedCameras')}</span>
          </div>
        </div>
      </header>

      {/* Cover Image */}
      {project.image && (
        <div className="relative w-full aspect-[2/1] md:aspect-[21/9] rounded-xl md:rounded-2xl overflow-hidden bg-muted">
          <SafeImage
            src={getProjectImageUrl(project.image)}
            alt={title}
            priority
            sizes="(max-width: 768px) 100vw, 1024px"
          />
        </div>
      )}
    </div>
  );
}
