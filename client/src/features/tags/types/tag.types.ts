export interface LocalizedString {
  ka: string;
  ru: string;
  en: string;
}

export interface ITag {
  id: string;
  slug: string;
  name: LocalizedString;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTagRequest {
  name: { ka: string; ru?: string; en?: string };
}

export interface UpdateTagRequest {
  name?: { ka?: string; ru?: string; en?: string };
}

// Shared sub-types used in article/project responses
export interface TagResponse {
  id: string;
  slug: string;
  name: LocalizedString;
}

export interface FaqResponse {
  id: string;
  question: LocalizedString;
  answer: LocalizedString;
  sortOrder: number;
}

export interface FaqInput {
  question: { ka: string; ru?: string; en?: string };
  answer: { ka: string; ru?: string; en?: string };
  sortOrder?: number;
}
