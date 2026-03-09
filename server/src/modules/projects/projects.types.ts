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

export interface CreateProjectInput {
  title: LocalizedString;
  location: LocalizedString;
  type: ProjectType;
  cameras: number;
  image?: string;
  year: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateProjectInput {
  title?: { ka?: string; ru?: string; en?: string };
  location?: { ka?: string; ru?: string; en?: string };
  type?: ProjectType;
  cameras?: number;
  image?: string | null;
  year?: string;
  isActive?: boolean;
  sortOrder?: number;
}
