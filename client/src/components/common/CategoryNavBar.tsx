import Link from 'next/link';
import {
  SecurityCamera,
  MonitorPlay,
  Toolbox,
  HardDrives,
  Wrench,
} from '@phosphor-icons/react';

interface CategoryItem {
  value: string;
  href: string;
  label: string;
  icon: React.ReactNode;
}

const CATEGORIES: CategoryItem[] = [
  {
    value: 'cameras',
    href: '/catalog?category=cameras',
    label: 'კამერები',
    icon: <SecurityCamera size={26} weight="duotone" aria-hidden="true" />,
  },
  {
    value: 'nvr-kits',
    href: '/catalog?category=nvr-kits',
    label: 'NVR კომპლექტები',
    icon: <MonitorPlay size={26} weight="duotone" aria-hidden="true" />,
  },
  {
    value: 'accessories',
    href: '/catalog?category=accessories',
    label: 'აქსესუარები',
    icon: <Toolbox size={26} weight="duotone" aria-hidden="true" />,
  },
  {
    value: 'storage',
    href: '/catalog?category=storage',
    label: 'შენახვა',
    icon: <HardDrives size={26} weight="duotone" aria-hidden="true" />,
  },
  {
    value: 'services',
    href: '/catalog?category=services',
    label: 'სერვისი',
    icon: <Wrench size={26} weight="duotone" aria-hidden="true" />,
  },
];

interface CategoryNavBarProps {
  counts?: Record<string, number>;
  badge?: string;
  title?: string;
  subtitle?: string;
  categoryLabels?: Record<string, string>;
}

export function CategoryNavBar({ counts, badge, title, subtitle, categoryLabels }: CategoryNavBarProps): React.ReactElement {
  const resolvedCategories = CATEGORIES.map((cat) => ({
    ...cat,
    label: categoryLabels?.[cat.value] ?? cat.label,
  }));
  return (
    <div className="flex flex-col items-center gap-5">
      {/* Badge + Title + subtitle above icons */}
      {(badge || title || subtitle) && (
        <div className="flex flex-col items-center gap-5">
          {badge && (
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-muted/60 border border-border/50">
              <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full rounded-full bg-online opacity-50 motion-safe:animate-ping" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-online" />
              </span>
              <span className="text-xs sm:text-sm md:text-base font-medium text-muted-foreground">{badge}</span>
            </div>
          )}
          <div className="text-center max-w-2xl px-2 sm:px-0">
            {title && (
              <h2 className="text-xl sm:text-2xl md:text-[30px] font-bold text-foreground leading-tight">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-2 text-sm sm:text-base text-muted-foreground leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Category icons */}
      <nav
        aria-label="Product categories"
        className="flex flex-wrap items-stretch justify-center gap-1 sm:flex-nowrap sm:gap-1.5 md:gap-2 rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-1.5 sm:p-2 md:p-2.5 w-full"
      >
        {resolvedCategories.map((cat) => {
          const count = counts?.[cat.value];

          return (
            <Link
              key={cat.value}
              href={cat.href}
              className="group relative flex min-w-[56px] flex-1 flex-col items-center gap-1 sm:gap-1.5 py-2 sm:py-2.5 md:py-3 px-1 sm:px-2 md:px-3 rounded-xl transition-all duration-200 ease-out hover:bg-primary/5 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 cursor-pointer"
            >
              <div className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-lg sm:rounded-xl bg-primary/8 border border-primary/10 text-primary/70 group-hover:bg-primary/12 group-hover:text-primary group-hover:border-primary/20 transition-all duration-200">
                {cat.icon}
                {count !== undefined && count > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 text-[9px] font-bold tabular-nums text-primary bg-primary/10 border border-primary/15 px-1.5 py-px rounded-full leading-none">
                    {count}
                  </span>
                )}
              </div>
              <span className="text-[10px] sm:text-xs font-semibold text-foreground/80 text-center leading-tight group-hover:text-primary transition-colors duration-200 w-full truncate">
                {cat.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
