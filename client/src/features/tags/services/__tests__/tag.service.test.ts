import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock axios config before importing service
vi.mock('@/lib/api/axios.config', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import { tagService } from '../tag.service';
import { apiClient } from '@/lib/api/axios.config';

const mockTag = {
  id: 'tag-1',
  slug: 'test-tag',
  name: { ka: 'ტესტი', ru: 'Тест', en: 'Test' },
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

describe('TagService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTags', () => {
    it('should fetch all tags without search', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { success: true, message: 'OK', data: [mockTag] },
      });

      const result = await tagService.getTags();

      expect(apiClient.get).toHaveBeenCalledWith('/tags', { params: undefined });
      expect(result).toEqual([mockTag]);
    });

    it('should pass search param when provided', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { success: true, message: 'OK', data: [mockTag] },
      });

      const result = await tagService.getTags('test');

      expect(apiClient.get).toHaveBeenCalledWith('/tags', { params: { search: 'test' } });
      expect(result).toEqual([mockTag]);
    });

    it('should return empty array when no tags found', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { success: true, message: 'OK', data: [] },
      });

      const result = await tagService.getTags();

      expect(result).toEqual([]);
    });
  });

  describe('createTag', () => {
    it('should create a tag with ka name only', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({
        data: { success: true, message: 'Created', data: mockTag },
      });

      const result = await tagService.createTag({ name: { ka: 'ტესტი' } });

      expect(apiClient.post).toHaveBeenCalledWith('/tags', { name: { ka: 'ტესტი' } });
      expect(result).toEqual(mockTag);
    });

    it('should create a tag with all languages', async () => {
      const input = { name: { ka: 'ტესტი', ru: 'Тест', en: 'Test' } };
      vi.mocked(apiClient.post).mockResolvedValue({
        data: { success: true, message: 'Created', data: mockTag },
      });

      await tagService.createTag(input);

      expect(apiClient.post).toHaveBeenCalledWith('/tags', input);
    });
  });

  describe('updateTag', () => {
    it('should update a tag by id', async () => {
      const updated = { ...mockTag, name: { ...mockTag.name, en: 'Updated' } };
      vi.mocked(apiClient.patch).mockResolvedValue({
        data: { success: true, message: 'Updated', data: updated },
      });

      const result = await tagService.updateTag('tag-1', { name: { en: 'Updated' } });

      expect(apiClient.patch).toHaveBeenCalledWith('/tags/tag-1', { name: { en: 'Updated' } });
      expect(result.name.en).toBe('Updated');
    });
  });

  describe('deleteTag', () => {
    it('should delete a tag by id', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({ data: { success: true } });

      await tagService.deleteTag('tag-1');

      expect(apiClient.delete).toHaveBeenCalledWith('/tags/tag-1');
    });
  });
});
