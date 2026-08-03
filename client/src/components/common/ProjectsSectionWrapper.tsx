'use client';

import { useActiveProjects } from '@/features/projects/hooks/useProjects';
import { usePublicSiteSettings } from '@/hooks/useSiteSettings';
import { ProjectsSection } from './ProjectsSection';
import { useLocale } from '@/lib/i18n';

import type { IProject } from '@/features/projects/types/projects.types';

interface ProjectForSection {
  id: string;
  slug: string;
  title: string;
  location: string;
  type: 'commercial' | 'residential' | 'retail' | 'office';
  cameras: number;
  image: string;
  year: string;
  updatedAt?: string;
}

export function ProjectsSectionWrapper(): React.ReactElement {
  const { data } = useActiveProjects({ limit: 4 });
  const { stats } = usePublicSiteSettings();
  const { localized, t } = useLocale();

  const mapped = data?.items?.slice(0, 4).map((p: IProject): ProjectForSection => ({
    id: p.id,
    slug: p.slug,
    title: localized(p.title),
    location: localized(p.location),
    type: p.type,
    cameras: p.cameras,
    image: p.image ?? '',
    year: p.year,
    updatedAt: p.updatedAt,
  })) ?? [];

  const labels = {
    badge: t('projects.badge'),
    heading: t('projects.heading'),
    camera: t('projects.camera'),
    project: t('projects.project'),
    year: t('projects.year'),
    viewAll: t('projects.viewAll'),
    typeLabels: {
      commercial: t('projects.type.commercial'),
      residential: t('projects.type.residential'),
      retail: t('projects.type.retail'),
      office: t('projects.type.office'),
    },
  };

  return <ProjectsSection projects={mapped} stats={stats} labels={labels} />;
}
