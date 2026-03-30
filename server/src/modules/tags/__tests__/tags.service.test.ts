import { describe, it, expect, vi, beforeEach } from 'vitest';
import { tagsService } from '../tags.service.js';
import { tagsRepository } from '../tags.repo.js';
import { NotFoundError } from '@shared/errors/errors.js';
import { resetMocks } from '@/test/setup.js';

// Mock dependencies
vi.mock('../tags.repo.js');
vi.mock('@libs/slugify.js', () => ({
  generateUniqueSlug: vi.fn().mockResolvedValue('test-slug'),
}));

// ── Test Fixtures ──────────────────────────────────────

const testTag = {
  id: 'tag-id-1',
  slug: 'ekonomika',
  name: { ka: 'ეკონომიკა', ru: 'Экономика', en: 'Economics' },
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const testTag2 = {
  id: 'tag-id-2',
  slug: 'anthropic',
  name: { ka: 'Anthropic', ru: '', en: '' },
  createdAt: '2024-01-02T00:00:00.000Z',
  updatedAt: '2024-01-02T00:00:00.000Z',
};

// ── Tests ──────────────────────────────────────────────

describe('Tags Service', () => {
  beforeEach(() => {
    resetMocks();
    vi.clearAllMocks();
  });

  describe('getAllTags', () => {
    it('should return all tags', async () => {
      // Arrange
      vi.mocked(tagsRepository.findAll).mockResolvedValue([testTag, testTag2]);

      // Act
      const result = await tagsService.getAllTags();

      // Assert
      expect(tagsRepository.findAll).toHaveBeenCalledWith(undefined);
      expect(result).toEqual([testTag, testTag2]);
      expect(result).toHaveLength(2);
    });

    it('should pass search parameter to repository', async () => {
      // Arrange
      vi.mocked(tagsRepository.findAll).mockResolvedValue([testTag]);

      // Act
      const result = await tagsService.getAllTags('ekonom');

      // Assert
      expect(tagsRepository.findAll).toHaveBeenCalledWith('ekonom');
      expect(result).toEqual([testTag]);
    });

    it('should return empty array when no tags exist', async () => {
      // Arrange
      vi.mocked(tagsRepository.findAll).mockResolvedValue([]);

      // Act
      const result = await tagsService.getAllTags();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('getTag', () => {
    it('should return a tag by id', async () => {
      // Arrange
      vi.mocked(tagsRepository.findById).mockResolvedValue(testTag);

      // Act
      const result = await tagsService.getTag('tag-id-1');

      // Assert
      expect(tagsRepository.findById).toHaveBeenCalledWith('tag-id-1');
      expect(result).toEqual(testTag);
    });

    it('should throw NotFoundError if tag does not exist', async () => {
      // Arrange
      vi.mocked(tagsRepository.findById).mockResolvedValue(null);

      // Act & Assert
      await expect(tagsService.getTag('nonexistent')).rejects.toThrow(NotFoundError);
      await expect(tagsService.getTag('nonexistent')).rejects.toThrow('Tag not found');
    });
  });

  describe('createTag', () => {
    it('should create a tag with all languages', async () => {
      // Arrange
      const input = { name: { ka: 'ეკონომიკა', ru: 'Экономика', en: 'Economics' } };
      vi.mocked(tagsRepository.create).mockResolvedValue(testTag);

      // Act
      const result = await tagsService.createTag(input);

      // Assert
      expect(tagsRepository.create).toHaveBeenCalledWith({
        slug: 'test-slug',
        nameKa: 'ეკონომიკა',
        nameRu: 'Экономика',
        nameEn: 'Economics',
      });
      expect(result).toEqual(testTag);
    });

    it('should create a tag with only Georgian name', async () => {
      // Arrange
      const input = { name: { ka: 'Anthropic', ru: '', en: '' } };
      vi.mocked(tagsRepository.create).mockResolvedValue(testTag2);

      // Act
      const result = await tagsService.createTag(input);

      // Assert
      expect(tagsRepository.create).toHaveBeenCalledWith({
        slug: 'test-slug',
        nameKa: 'Anthropic',
        nameRu: '',
        nameEn: '',
      });
      expect(result).toEqual(testTag2);
    });
  });

  describe('updateTag', () => {
    it('should update a tag name', async () => {
      // Arrange
      const updatedTag = { ...testTag, name: { ...testTag.name, en: 'Updated' } };
      vi.mocked(tagsRepository.existsById).mockResolvedValue(true);
      vi.mocked(tagsRepository.update).mockResolvedValue(updatedTag);

      // Act
      const result = await tagsService.updateTag('tag-id-1', { name: { en: 'Updated' } });

      // Assert
      expect(tagsRepository.existsById).toHaveBeenCalledWith('tag-id-1');
      expect(tagsRepository.update).toHaveBeenCalledWith('tag-id-1', {
        nameKa: undefined,
        nameRu: undefined,
        nameEn: 'Updated',
      });
      expect(result).toEqual(updatedTag);
    });

    it('should throw NotFoundError if tag does not exist', async () => {
      // Arrange
      vi.mocked(tagsRepository.existsById).mockResolvedValue(false);

      // Act & Assert
      await expect(
        tagsService.updateTag('nonexistent', { name: { en: 'test' } }),
      ).rejects.toThrow(NotFoundError);
      expect(tagsRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteTag', () => {
    it('should delete an existing tag', async () => {
      // Arrange
      vi.mocked(tagsRepository.existsById).mockResolvedValue(true);
      vi.mocked(tagsRepository.delete).mockResolvedValue(undefined);

      // Act
      await tagsService.deleteTag('tag-id-1');

      // Assert
      expect(tagsRepository.existsById).toHaveBeenCalledWith('tag-id-1');
      expect(tagsRepository.delete).toHaveBeenCalledWith('tag-id-1');
    });

    it('should throw NotFoundError if tag does not exist', async () => {
      // Arrange
      vi.mocked(tagsRepository.existsById).mockResolvedValue(false);

      // Act & Assert
      await expect(tagsService.deleteTag('nonexistent')).rejects.toThrow(NotFoundError);
      expect(tagsRepository.delete).not.toHaveBeenCalled();
    });
  });
});
