export type ProjectType = 'commercial' | 'residential' | 'retail' | 'office';

export interface LocalizedString {
  ka: string;
  ru: string;
  en: string;
}

export interface IProject {
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

export interface CreateProjectRequest {
  slug: string;
  title: LocalizedString;
  excerpt?: { ka?: string; ru?: string; en?: string };
  location: LocalizedString;
  type: ProjectType;
  cameras: number;
  image?: string;
  content?: string;
  year: string;
  isActive: boolean;
  sortOrder?: number;
}

export type UpdateProjectRequest = Partial<Omit<CreateProjectRequest, 'image'>> & {
  image?: string | null;
};

export interface AdminProjectFilters {
  page?: number;
  limit?: number;
  isActive?: string;
}
