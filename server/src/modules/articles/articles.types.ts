/**
 * Articles Module — Types
 */

export type ArticleCategory = 'cameras' | 'nvr' | 'installation' | 'news' | 'guides';

export interface ArticleResponse {
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
  createdAt: string;
  updatedAt: string;
}

export interface CreateArticleInput {
  slug?: string;
  title: string;
  excerpt: string;
  content: string;
  category: ArticleCategory;
  readMin?: number;
  isPublished?: boolean;
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
}
