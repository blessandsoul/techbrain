'use client';

import { Badge } from '@/components/ui/badge';
import { useLocale } from '@/lib/i18n';

import type { TagResponse } from '@/features/tags/types/tag.types';

interface TagsCloudProps {
  tags: TagResponse[];
}

export function TagsCloud({ tags }: TagsCloudProps): React.ReactElement | null {
  const { localized } = useLocale();

  if (tags.length === 0) return null;

  return (
    <section className="max-w-[680px] mx-auto mt-8 md:mt-10">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge key={tag.id} variant="secondary" className="text-xs px-3 py-1 pointer-events-none">
            {localized(tag.name)}
          </Badge>
        ))}
      </div>
    </section>
  );
}
