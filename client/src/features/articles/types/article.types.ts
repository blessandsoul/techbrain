import type { TagResponse, FaqResponse, FaqInput } from '@/features/tags/types/tag.types';

export type ArticleCategory = 'cameras' | 'nvr' | 'installation' | 'news' | 'guides';

export interface IArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
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
}

export interface CreateArticleInput {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: ArticleCategory;
  readMin?: number;
  isPublished?: boolean;
  tagIds?: string[];
  faqs?: FaqInput[];
}

export interface UpdateArticleInput {
  slug?: string;
  title?: string;
  excerpt?: string;
  content?: string;
  category?: ArticleCategory;
  coverImage?: string | null;
  videoUrl?: string | null;
  readMin?: number;
  isPublished?: boolean;
  tagIds?: string[];
  faqs?: FaqInput[];
}
