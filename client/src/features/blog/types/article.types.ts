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
  createdAt: string;
  updatedAt: string;
  content: string; // raw MDX body
}

export interface ArticleFilters {
  category?: string;
}
