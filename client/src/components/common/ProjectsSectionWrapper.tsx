'use client';

import { useActiveProjects } from '@/features/projects/hooks/useProjects';
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
  const { data: projects } = useActiveProjects();
  const { localized } = useLocale();

  const mapped = projects?.slice(0, 4).map((p: IProject): ProjectForSection => ({
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

  // TODO: Wire stats to real site settings API
  const stats = {
    camerasInstalled: '500+',
    projectsCompleted: '120+',
    yearsExperience: '5+',
  };

  const { t } = useLocale();

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
