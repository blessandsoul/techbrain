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
      {/* Type breadcrumb */}
      <div className="flex items-center justify-center gap-2 pt-4 md:pt-8 mb-4 md:mb-6">
        <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
          <Icon size={13} weight="duotone" aria-hidden="true" />
          {typeLabel}
        </span>
      </div>

      {/* Title — UPPERCASE */}
      <h1 className="text-center text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-[1.15] tracking-tight text-balance uppercase max-w-3xl mx-auto mb-6 md:mb-8">
        {title}
      </h1>

      {/* Metadata row */}
      <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground flex-wrap mb-8 md:mb-10">
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

      {/* Cover Image — 1:1 (800x800) */}
      {project.image && (
        <div className="relative w-full max-w-[600px] mx-auto aspect-square rounded-xl md:rounded-2xl overflow-hidden bg-muted mb-8 md:mb-10">
          <SafeImage
            src={getProjectImageUrl(project.image)}
            alt={title}
            priority
            sizes="(max-width: 768px) 100vw, 600px"
          />
        </div>
      )}

      {/* Description / Excerpt — after cover */}
      {excerpt && (
        <p className="text-center text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          {excerpt}
        </p>
      )}
    </div>
  );
}
