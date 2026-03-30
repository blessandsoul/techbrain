/**
 * Tags Module — Types
 */

export interface LocalizedString {
  ka: string;
  ru: string;
  en: string;
}

export interface TagResponse {
  id: string;
  slug: string;
  name: LocalizedString;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTagInput {
  name: LocalizedString;
}

export interface UpdateTagInput {
  name?: { ka?: string; ru?: string; en?: string };
}
