/**
 * Tags Module — Service
 *
 * Business logic for tag management.
 */

import { NotFoundError } from '@shared/errors/errors.js';
import { generateUniqueSlug } from '@libs/slugify.js';
import { tagsRepository } from './tags.repo.js';
import type { TagResponse, CreateTagInput, UpdateTagInput } from './tags.types.js';

class TagsService {
  async getAllTags(search?: string): Promise<TagResponse[]> {
    return tagsRepository.findAll(search);
  }

  async getTag(id: string): Promise<TagResponse> {
    const tag = await tagsRepository.findById(id);
    if (!tag) {
      throw new NotFoundError('Tag not found', 'TAG_NOT_FOUND');
    }
    return tag;
  }

  async createTag(input: CreateTagInput): Promise<TagResponse> {
    const slug = await generateUniqueSlug(
      input.name.ka,
      (s) => tagsRepository.existsBySlug(s),
    );

    return tagsRepository.create({
      slug,
      nameKa: input.name.ka,
      nameRu: input.name.ru ?? '',
      nameEn: input.name.en ?? '',
    });
  }

  async updateTag(id: string, input: UpdateTagInput): Promise<TagResponse> {
    const exists = await tagsRepository.existsById(id);
    if (!exists) {
      throw new NotFoundError('Tag not found', 'TAG_NOT_FOUND');
    }

    return tagsRepository.update(id, {
      nameKa: input.name?.ka,
      nameRu: input.name?.ru,
      nameEn: input.name?.en,
    });
  }

  async deleteTag(id: string): Promise<void> {
    const exists = await tagsRepository.existsById(id);
    if (!exists) {
      throw new NotFoundError('Tag not found', 'TAG_NOT_FOUND');
    }
    await tagsRepository.delete(id);
  }
}

export const tagsService = new TagsService();
