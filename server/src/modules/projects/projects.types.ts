/**
 * Projects Module — Types
 */

export type ProjectType = 'commercial' | 'residential' | 'retail' | 'office';

export interface LocalizedString {
  ka: string;
  ru: string;
  en: string;
}

export interface ProjectTagResponse {
  id: string;
  slug: string;
  name: LocalizedString;
}

export interface ProjectFaqResponse {
  id: string;
  question: LocalizedString;
  answer: LocalizedString;
  sortOrder: number;
}

export interface ProjectResponse {
  id: string;
  slug: string;
  title: LocalizedString;
  excerpt: LocalizedString;
  location: LocalizedString;
  type: ProjectType;
  cameras: number;
  image: string | null;
  videoUrl: string | null;
  content: string;
  year: string;
  isActive: boolean;
  sortOrder: number;
  tags: ProjectTagResponse[];
  faqs: ProjectFaqResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface FaqInput {
  question: { ka: string; ru?: string; en?: string };
  answer: { ka: string; ru?: string; en?: string };
  sortOrder?: number;
}

export interface CreateProjectInput {
  slug?: string;
  title: LocalizedString;
  excerpt?: { ka?: string; ru?: string; en?: string };
  location: LocalizedString;
  type: ProjectType;
  cameras: number;
  image?: string;
  videoUrl?: string | null;
  content?: string;
  year: string;
  isActive?: boolean;
  sortOrder?: number;
  tagIds?: string[];
  faqs?: FaqInput[];
}

export interface UpdateProjectInput {
  slug?: string;
  title?: { ka?: string; ru?: string; en?: string };
  excerpt?: { ka?: string; ru?: string; en?: string };
  location?: { ka?: string; ru?: string; en?: string };
  type?: ProjectType;
  cameras?: number;
  image?: string | null;
  videoUrl?: string | null;
  content?: string;
  year?: string;
  isActive?: boolean;
  sortOrder?: number;
  tagIds?: string[];
  faqs?: FaqInput[];
}
