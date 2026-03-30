/**
 * Articles Module — Types
 */

export type ArticleCategory = 'cameras' | 'nvr' | 'installation' | 'news' | 'guides';

export interface ArticleTagResponse {
  id: string;
  slug: string;
  name: { ka: string; ru: string; en: string };
}

export interface ArticleFaqResponse {
  id: string;
  question: { ka: string; ru: string; en: string };
  answer: { ka: string; ru: string; en: string };
  sortOrder: number;
}

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
  tags: ArticleTagResponse[];
  faqs: ArticleFaqResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface FaqInput {
  question: { ka: string; ru?: string; en?: string };
  answer: { ka: string; ru?: string; en?: string };
  sortOrder?: number;
}

export interface CreateArticleInput {
  slug?: string;
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
