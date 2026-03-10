/**
 * Projects Module — Types
 */

export type ProjectType = 'commercial' | 'residential' | 'retail' | 'office';

export interface LocalizedString {
  ka: string;
  ru: string;
  en: string;
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
  content: string;
  year: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectInput {
  slug: string;
  title: LocalizedString;
  excerpt?: { ka?: string; ru?: string; en?: string };
  location: LocalizedString;
  type: ProjectType;
  cameras: number;
  image?: string;
  content?: string;
  year: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateProjectInput {
  slug?: string;
  title?: { ka?: string; ru?: string; en?: string };
  excerpt?: { ka?: string; ru?: string; en?: string };
  location?: { ka?: string; ru?: string; en?: string };
  type?: ProjectType;
  cameras?: number;
  image?: string | null;
  content?: string;
  year?: string;
  isActive?: boolean;
  sortOrder?: number;
}
