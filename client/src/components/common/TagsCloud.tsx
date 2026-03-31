'use client';

import Link from 'next/link';
import { useLocale } from '@/lib/i18n';

import type { TagResponse } from '@/features/tags/types/tag.types';

interface TagsCloudProps {
  tags: TagResponse[];
  context?: 'blog' | 'projects';
}

const TAG_POSITIONS = [
  { top: 8,  left: 35, size: 'sm' },
  { top: 25, left: 8,  size: 'sm' },
  { top: 22, left: 55, size: 'md' },
  { top: 42, left: 32, size: 'lg' },
  { top: 38, left: 65, size: 'xs' },
  { top: 55, left: 12, size: 'md' },
  { top: 58, left: 60, size: 'xs' },
  { top: 72, left: 28, size: 'sm' },
  { top: 70, left: 55, size: 'sm' },
  { top: 85, left: 40, size: 'xs' },
] as const;

const SIZE_MAP = {
  xs: 'text-xs px-2.5 py-1',
  sm: 'text-sm px-3 py-1',
  md: 'text-sm px-3 py-1.5',
  lg: 'text-base px-3.5 py-1.5',
} as const;

/* Each tag gets a different animation duration (3-5s) and delay
   so they drift out of sync, creating an organic floating effect. */
const FLOAT_STYLES = [
  { duration: '6s',   delay: '0s' },
  { duration: '7s',   delay: '0.8s' },
  { duration: '8s',   delay: '0.3s' },
  { duration: '6.5s', delay: '1.2s' },
  { duration: '9s',   delay: '0.5s' },
  { duration: '7.5s', delay: '1.5s' },
  { duration: '6.8s', delay: '1s' },
  { duration: '8.5s', delay: '0.2s' },
  { duration: '7.2s', delay: '1.4s' },
  { duration: '8s',   delay: '0.6s' },
] as const;

export function TagsCloud({ tags, context = 'blog' }: TagsCloudProps): React.ReactElement | null {
  const { t, localized } = useLocale();

  if (tags.length === 0) return null;

  const basePath = context === 'projects' ? '/projects' : '/blog';

  return (
    <section className="max-w-[680px] mx-auto mt-10 md:mt-14">
      <style>{`
        @keyframes tag-float {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(6px, -8px); }
          50% { transform: translate(-4px, 5px); }
          75% { transform: translate(5px, 3px); }
        }
      `}</style>

      <h3 className="text-lg md:text-xl font-semibold text-foreground mb-6">
        {t('tags.title')}
      </h3>

      <div
        className="relative rounded-2xl bg-gradient-to-br from-primary/[0.04] via-transparent to-primary/[0.07]"
        style={{ minHeight: `${Math.max(200, Math.ceil(tags.length / 2) * 80)}px` }}
      >
        {tags.map((tag, index) => {
          const pos = TAG_POSITIONS[index % TAG_POSITIONS.length];
          const sizeClass = SIZE_MAP[pos.size];
          const float = FLOAT_STYLES[index % FLOAT_STYLES.length];

          return (
            <Link
              key={tag.id}
              href={`${basePath}?tag=${tag.slug}`}
              className={`motion-safe:animate-[tag-float] absolute inline-flex items-center gap-1 rounded-full font-medium bg-card text-foreground/70 shadow-sm border border-border/40 transition-[shadow,border-color,color] duration-200 active:scale-[0.95] md:hover:shadow-md md:hover:border-primary/30 md:hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/50 outline-none whitespace-nowrap ${sizeClass}`}
              style={{
                top: `${pos.top}%`,
                left: `${pos.left}%`,
                animation: `tag-float ${float.duration} ease-in-out ${float.delay} infinite`,
              }}
            >
              <span className="font-semibold text-primary/50">#</span>
              {localized(tag.name)}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
