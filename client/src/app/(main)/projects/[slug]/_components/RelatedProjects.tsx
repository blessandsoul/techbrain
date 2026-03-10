'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, MapPin, SecurityCamera, Buildings, House, Storefront } from '@phosphor-icons/react/dist/ssr';
import { SafeImage } from '@/components/common/SafeImage';
import { Skeleton } from '@/components/ui/skeleton';
import { useActiveProjects, getProjectImageUrl } from '@/features/projects/hooks/useProjects';
import { useLocale } from '@/lib/i18n';

import type { IProject, ProjectType } from '@/features/projects/types/projects.types';

const TYPE_ICONS: Record<ProjectType, typeof Buildings> = {
  commercial: Buildings,
  residential: House,
  retail: Storefront,
  office: Buildings,
};

interface RelatedProjectsProps {
  currentSlug: string;
  type: string;
}

const DISPLAY_COUNT = 4;

export function RelatedProjects({ currentSlug, type }: RelatedProjectsProps): React.ReactElement | null {
  const { t, localized } = useLocale();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Fetch same-type projects
  const { data: sameTypeData, isLoading: loadingSame } = useActiveProjects({
    type,
    limit: DISPLAY_COUNT + 1,
  });

  // Fetch recent projects as fallback
  const { data: recentData, isLoading: loadingRecent } = useActiveProjects({
    limit: DISPLAY_COUNT + 1,
  });

  const projects = buildProjectList(sameTypeData, recentData, currentSlug);
  const isLoading = loadingSame || loadingRecent;

  const updateScrollButtons = useCallback((): void => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollButtons();
    el.addEventListener('scroll', updateScrollButtons, { passive: true });
    window.addEventListener('resize', updateScrollButtons);
    return (): void => {
      el.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, [updateScrollButtons, projects]);

  const scroll = useCallback((direction: 'left' | 'right'): void => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector('[data-card]')?.clientWidth ?? 300;
    const gap = 16;
    el.scrollBy({
      left: direction === 'left' ? -(cardWidth + gap) : cardWidth + gap,
      behavior: 'smooth',
    });
  }, []);

  if (!isLoading && projects.length === 0) return null;

  return (
    <section className="mt-16 md:mt-24">
      <div className="w-12 h-px bg-border mx-auto mb-10 md:mb-14" />

      <div className="flex items-center justify-between mb-6 md:mb-8">
        <h2 className="text-lg md:text-xl font-bold text-foreground">
          {t('projects.relatedProjects')}
        </h2>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
            className="p-2 rounded-full border border-border bg-card text-muted-foreground transition-all active:scale-95 md:hover:text-foreground md:hover:border-foreground/20 disabled:opacity-30 disabled:pointer-events-none"
          >
            <ArrowLeft size={16} weight="bold" />
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            aria-label="Scroll right"
            className="p-2 rounded-full border border-border bg-card text-muted-foreground transition-all active:scale-95 md:hover:text-foreground md:hover:border-foreground/20 disabled:opacity-30 disabled:pointer-events-none"
          >
            <ArrowRight size={16} weight="bold" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 -mx-4 px-4 md:-mx-0 md:px-0"
      >
        {isLoading
          ? Array.from({ length: DISPLAY_COUNT }).map((_, i) => (
              <div
                key={i}
                className="w-[280px] md:w-[calc(25%-12px)] shrink-0 snap-start"
                data-card
              >
                <ProjectCardSkeleton />
              </div>
            ))
          : projects.map((project) => (
              <div
                key={project.id}
                className="w-[280px] md:w-[calc(25%-12px)] shrink-0 snap-start"
                data-card
              >
                <RelatedProjectCard project={project} />
              </div>
            ))}
      </div>
    </section>
  );
}

function RelatedProjectCard({ project }: {
  project: IProject;
}): React.ReactElement {
  const { t, localized } = useLocale();
  const title = localized(project.title);
  const location = localized(project.location);
  const Icon = TYPE_ICONS[project.type];
  const typeLabel = t(`projects.type.${project.type}` as keyof typeof import('@/lib/i18n/locales/ka.json'));

  return (
    <Link href={`/projects/${project.slug}`} className="group block h-full">
      <article className="flex flex-col h-full rounded-xl overflow-hidden border border-border/50 bg-card transition-all duration-300 active:scale-[0.98] md:hover:-translate-y-1 md:hover:border-primary/20 md:hover:shadow-lg">
        <div className="relative aspect-[16/10] overflow-hidden bg-muted shrink-0">
          {project.image ? (
            <SafeImage
              src={getProjectImageUrl(project.image)}
              alt={title}
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
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
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-background/90 backdrop-blur-sm border border-border/60 text-[10px] font-bold tabular-nums text-muted-foreground">
              <span className="w-1 h-1 rounded-full bg-primary" aria-hidden="true" />
              {project.year}
            </span>
          </div>
        </div>

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
}

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

function buildProjectList(
  sameTypeItems: IProject[] | undefined,
  recentItems: IProject[] | undefined,
  excludeSlug: string,
): IProject[] {
  const seen = new Set<string>([excludeSlug]);
  const result: IProject[] = [];

  for (const project of sameTypeItems ?? []) {
    if (seen.has(project.slug)) continue;
    seen.add(project.slug);
    result.push(project);
    if (result.length >= DISPLAY_COUNT) return result;
  }

  for (const project of recentItems ?? []) {
    if (seen.has(project.slug)) continue;
    seen.add(project.slug);
    result.push(project);
    if (result.length >= DISPLAY_COUNT) return result;
  }

  return result;
}
