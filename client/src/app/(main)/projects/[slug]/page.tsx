'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useProjectBySlug } from '@/features/projects/hooks/useProjects';
import { useLocale } from '@/lib/i18n';
import { ReadingProgress } from './_components/ReadingProgress';
import { ProjectHero } from './_components/ProjectHero';
import { ProjectBody } from './_components/ProjectBody';
import { ProjectFooter } from './_components/ProjectFooter';
import { RelatedProjects } from './_components/RelatedProjects';
import { ProjectDetailSkeleton } from './_components/ProjectDetailSkeleton';

export default function ProjectDetailPage(): React.ReactElement {
  const { t, localized } = useLocale();
  const { slug } = useParams<{ slug: string }>();
  const { data: project, isLoading, error } = useProjectBySlug(slug);

  return (
    <>
      {project && <ReadingProgress />}

      <div className="mx-auto px-4 md:px-8 lg:px-12 max-w-5xl pb-12 md:pb-20">
        {error ? (
          <ErrorState />
        ) : isLoading ? (
          <ProjectDetailSkeleton />
        ) : !project ? (
          <div className="text-center py-16 text-muted-foreground">
            {t('projects.notFound')}
          </div>
        ) : (
          <article>
            <ProjectHero project={project} />
            <ProjectBody content={project.content} />
            <ProjectFooter title={localized(project.title)} />
            <RelatedProjects currentSlug={slug} type={project.type} />
          </article>
        )}
      </div>
    </>
  );
}

function ErrorState(): React.ReactElement {
  const { t } = useLocale();

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-muted-foreground">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
      </div>
      <p className="text-sm text-muted-foreground mb-3">{t('projects.notFound')}</p>
      <Link
        href="/projects"
        className="text-sm text-primary active:opacity-70 md:hover:text-primary/80 transition-colors"
      >
        {t('projects.backToProjects')}
      </Link>
    </div>
  );
}
