export type ProjectType = 'commercial' | 'residential' | 'retail' | 'office';

export interface LocalizedString {
  ka: string;
  ru: string;
  en: string;
}

export interface IProject {
  id: string;
  title: LocalizedString;
  location: LocalizedString;
  type: ProjectType;
  cameras: number;
  image: string | null;
  year: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectRequest {
  title: LocalizedString;
  location: LocalizedString;
  type: ProjectType;
  cameras: number;
  image?: string;
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
