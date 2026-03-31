import type { TagResponse, FaqResponse } from '@/features/tags/types/tag.types';

export type ArticleCategory = 'cameras' | 'nvr' | 'installation' | 'news' | 'guides';

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: ArticleCategory;
  coverImage: string | null;
  videoUrl: string | null;
  isPublished: boolean;
  readMin: number;
  authorId: string;
  tags: TagResponse[];
  faqs: FaqResponse[];
  createdAt: string;
  updatedAt: string;
  content: string; // raw MDX body
}

export interface ArticleFilters {
  category?: string;
  tag?: string;
}
