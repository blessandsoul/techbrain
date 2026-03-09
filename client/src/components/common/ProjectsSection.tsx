import Link from 'next/link';
import { MapPin, Buildings, House, Storefront, SecurityCamera, ArrowRight } from '@phosphor-icons/react/dist/ssr';
import { SafeImage } from '@/components/common/SafeImage';
import { getProjectImageUrl } from '@/features/projects/hooks/useProjects';

interface Project {
  id: string;
  title: string;
  location: string;
  type: 'commercial' | 'residential' | 'retail' | 'office';
  cameras: number;
  image: string;
  year: string;
}

interface Stats {
  camerasInstalled: string;
  projectsCompleted: string;
  yearsExperience: string;
}

const TYPE_ICONS = {
  commercial: Buildings,
  residential: House,
  retail: Storefront,
  office: Buildings,
};

const TYPE_LABELS_FALLBACK: Record<string, string> = {
  commercial: 'კომერციული',
  residential: 'საცხოვრებელი',
  retail: 'სავაჭრო',
  office: 'საოფისე',
};

function splitStat(value: string): { num: string; suffix: string } {
  const match = value.match(/^([\d,.]+)(.*)$/);
  return match ? { num: match[1], suffix: match[2] } : { num: value, suffix: '' };
}

interface ProjectsSectionLabels {
  badge: string;
  heading: string;
  camera: string;
  project: string;
  year: string;
  viewAll: string;
  typeLabels: Record<string, string>;
}

interface ProjectsSectionProps {
  projects: Project[];
  stats: Stats;
  labels?: ProjectsSectionLabels;
}

export function ProjectsSection({ projects, stats, labels }: ProjectsSectionProps): React.ReactElement {
  const l = {
    badge: labels?.badge ?? 'ჩვენი პორტფოლიო',
    heading: labels?.heading ?? 'განხორციელებული პროექტები',
    camera: labels?.camera ?? 'კამერა',
    project: labels?.project ?? 'პროექტი',
    year: labels?.year ?? 'წელი',
    viewAll: labels?.viewAll ?? '{l.viewAll}',
    typeLabels: labels?.typeLabels ?? TYPE_LABELS_FALLBACK,
  };
  const cameraStat = splitStat(stats.camerasInstalled);
  const projectsStat = splitStat(stats.projectsCompleted);
  const yearsStat = splitStat(stats.yearsExperience);

  if (projects.length === 0) return <></>;

  return (
    <section className="py-10 lg:py-14 bg-background" aria-labelledby="projects-heading">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">

        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" aria-hidden="true" />
              {l.badge}
            </span>
            <h2 id="projects-heading" className="text-2xl md:text-3xl font-bold text-foreground">
              {l.heading}
            </h2>
          </div>

          {/* Stats + "View all" — desktop */}
          <div className="hidden md:flex items-center gap-8">
            <div className="text-right">
              <div className="text-3xl font-black text-foreground tabular-nums">{cameraStat.num}<span className="text-primary">{cameraStat.suffix}</span></div>
              <div className="text-xs text-muted-foreground uppercase tracking-widest">{l.camera}</div>
            </div>
            <div className="h-8 w-px bg-border" aria-hidden="true" />
            <div className="text-right">
              <div className="text-3xl font-black text-foreground tabular-nums">{projectsStat.num}<span className="text-primary">{projectsStat.suffix}</span></div>
              <div className="text-xs text-muted-foreground uppercase tracking-widest">{l.project}</div>
            </div>
            <div className="h-8 w-px bg-border" aria-hidden="true" />
            <div className="text-right">
              <div className="text-3xl font-black text-foreground tabular-nums">{yearsStat.num}<span className="text-primary">{yearsStat.suffix}</span></div>
              <div className="text-xs text-muted-foreground uppercase tracking-widest">{l.year}</div>
            </div>
            <div className="h-8 w-px bg-border" aria-hidden="true" />
            <Link
              href="/projects"
              className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-lg px-2 py-1"
            >
              {l.viewAll}
              <ArrowRight size={14} weight="bold" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* Stats — mobile */}
        <div className="grid grid-cols-3 gap-3 mb-6 md:hidden">
          <div className="text-center p-3 rounded-xl bg-card border border-border/50">
            <div className="text-xl font-black text-foreground tabular-nums">{cameraStat.num}<span className="text-primary text-sm">{cameraStat.suffix}</span></div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">{l.camera}</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-card border border-border/50">
            <div className="text-xl font-black text-foreground tabular-nums">{projectsStat.num}<span className="text-primary text-sm">{projectsStat.suffix}</span></div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">{l.project}</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-card border border-border/50">
            <div className="text-xl font-black text-foreground tabular-nums">{yearsStat.num}<span className="text-primary text-sm">{yearsStat.suffix}</span></div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">{l.year}</div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {projects.map((project) => {
            const Icon = TYPE_ICONS[project.type];
            const typeLabel = l.typeLabels[project.type] ?? TYPE_LABELS_FALLBACK[project.type];
            return (
              <Link key={project.id} href={`/projects/${project.id}`} className="group">
                <article
                  className="relative rounded-xl overflow-hidden border border-border/50 bg-card transition-all duration-300 active:scale-[0.98] md:hover:-translate-y-1 md:hover:border-primary/20 md:hover:shadow-lg h-full"
                >
                  {/* Image */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                    {project.image ? (
                      <SafeImage
                        src={getProjectImageUrl(project.image)}
                        alt={project.title}
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
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
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-background/90 backdrop-blur-sm border border-border/60 text-[10px] font-bold tabular-nums text-muted-foreground">
                        <span className="w-1 h-1 rounded-full bg-primary" aria-hidden="true" />
                        {project.year}
                      </span>
                    </div>

                    {/* Cameras count */}
                    <div className="absolute bottom-3 left-3">
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-background/90 backdrop-blur-sm border border-border/60 text-[10px] font-bold text-foreground">
                        <span className="relative flex h-1.5 w-1.5 shrink-0" aria-hidden="true">
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-online" />
                        </span>
                        <span className="tabular-nums">{project.cameras}</span>
                        <span className="text-muted-foreground font-semibold">{l.camera}</span>
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4 flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Icon size={13} weight="duotone" className="text-primary shrink-0" aria-hidden="true" />
                      <span className="text-xs font-bold uppercase tracking-[0.12em]">{typeLabel}</span>
                    </div>

                    <h3 className="text-sm font-bold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-200">
                      {project.title}
                    </h3>

                    <div className="flex items-center gap-1 text-muted-foreground mt-0.5">
                      <MapPin size={13} weight="fill" className="shrink-0" aria-hidden="true" />
                      <span className="text-xs truncate">{project.location}</span>
                    </div>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>

        {/* Mobile — see all */}
        <div className="mt-8 flex justify-center md:hidden">
          <Link
            href="/projects"
            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-primary/30 text-primary text-sm font-semibold hover:bg-primary/5 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            {l.viewAll}
            <ArrowRight size={14} weight="bold" aria-hidden="true" />
          </Link>
        </div>

      </div>
    </section>
  );
}
