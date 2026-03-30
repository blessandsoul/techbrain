import { describe, it, expect, vi, beforeEach } from 'vitest';
import { articlesService } from '../articles.service.js';
import { articlesRepository } from '../articles.repo.js';
import { NotFoundError, ConflictError } from '@shared/errors/errors.js';
import { resetMocks } from '@/test/setup.js';

// Mock dependencies
vi.mock('../articles.repo.js');
vi.mock('@libs/slugify.js', () => ({
  generateUniqueSlug: vi.fn().mockResolvedValue('test-article-slug'),
}));
vi.mock('@libs/storage/file-storage.service.js', () => ({
  fileStorageService: {
    deleteArticleDir: vi.fn().mockResolvedValue(undefined),
    deleteArticleVideo: vi.fn().mockResolvedValue(undefined),
    deleteArticleCoverImage: vi.fn().mockResolvedValue(undefined),
    saveArticleCoverImage: vi.fn().mockResolvedValue({ url: '/uploads/cover.webp' }),
    saveArticleVideo: vi.fn().mockResolvedValue({ url: '/uploads/video.mp4' }),
    saveArticleContentImage: vi.fn().mockResolvedValue({ url: '/uploads/content.webp' }),
  },
}));
vi.mock('@libs/storage/image-optimizer.service.js', () => ({
  imageOptimizerService: {
    optimizeArticleCover: vi.fn().mockResolvedValue(Buffer.from('optimized')),
    optimizeArticleContentImage: vi.fn().mockResolvedValue(Buffer.from('optimized')),
  },
}));
vi.mock('@libs/storage/file-validator.js');
vi.mock('@libs/storage/video-validator.js');

// ── Test Fixtures ──────────────────────────────────────

const testArticle = {
  id: 'article-id-1',
  slug: 'test-article',
  title: 'Test Article',
  excerpt: 'Test excerpt',
  content: '<p>Test content</p>',
  category: 'news' as const,
  coverImage: null,
  videoUrl: null,
  isPublished: true,
  readMin: 5,
  authorId: 'user-id-1',
  tags: [
    { id: 'tag-1', slug: 'ai', name: { ka: 'AI', ru: '', en: 'AI' } },
  ],
  faqs: [
    {
      id: 'faq-1',
      question: { ka: 'კითხვა?', ru: '', en: 'Question?' },
      answer: { ka: 'პასუხი', ru: '', en: 'Answer' },
      sortOrder: 0,
    },
  ],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const testArticleNoRelations = {
  ...testArticle,
  tags: [],
  faqs: [],
};

// ── Tests ──────────────────────────────────────────────

describe('Articles Service', () => {
  beforeEach(() => {
    resetMocks();
    vi.clearAllMocks();
  });

  describe('getPublishedArticles', () => {
    it('should return paginated published articles with tags and faqs', async () => {
      // Arrange
      const result = { items: [testArticle], totalItems: 1 };
      vi.mocked(articlesRepository.findPublishedPaginated).mockResolvedValue(result);

      // Act
      const response = await articlesService.getPublishedArticles(1, 10);

      // Assert
      expect(articlesRepository.findPublishedPaginated).toHaveBeenCalledWith(1, 10, undefined);
      expect(response.items[0].tags).toHaveLength(1);
      expect(response.items[0].faqs).toHaveLength(1);
      expect(response.items[0].tags[0].id).toBe('tag-1');
      expect(response.items[0].faqs[0].question.ka).toBe('კითხვა?');
    });

    it('should pass category filter', async () => {
      // Arrange
      vi.mocked(articlesRepository.findPublishedPaginated).mockResolvedValue({ items: [], totalItems: 0 });

      // Act
      await articlesService.getPublishedArticles(1, 10, 'cameras');

      // Assert
      expect(articlesRepository.findPublishedPaginated).toHaveBeenCalledWith(1, 10, 'cameras');
    });
  });

  describe('getArticleBySlug', () => {
    it('should return article with tags and faqs', async () => {
      // Arrange
      vi.mocked(articlesRepository.findBySlug).mockResolvedValue(testArticle);

      // Act
      const result = await articlesService.getArticleBySlug('test-article');

      // Assert
      expect(result.tags).toHaveLength(1);
      expect(result.faqs).toHaveLength(1);
    });

    it('should throw NotFoundError if article not found', async () => {
      // Arrange
      vi.mocked(articlesRepository.findBySlug).mockResolvedValue(null);

      // Act & Assert
      await expect(articlesService.getArticleBySlug('nonexistent')).rejects.toThrow(NotFoundError);
    });
  });

  describe('createArticle', () => {
    it('should create article with tags and faqs', async () => {
      // Arrange
      const input = {
        title: 'New Article',
        excerpt: 'Excerpt',
        content: '<p>Content</p>',
        category: 'news' as const,
        tagIds: ['tag-1', 'tag-2'],
        faqs: [
          {
            question: { ka: 'კითხვა?', ru: '', en: 'Q?' },
            answer: { ka: 'პასუხი', ru: '', en: 'A' },
            sortOrder: 0,
          },
        ],
      };
      vi.mocked(articlesRepository.create).mockResolvedValue(testArticle);

      // Act
      const result = await articlesService.createArticle(input, 'user-id-1');

      // Assert
      expect(articlesRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tagIds: ['tag-1', 'tag-2'],
          faqs: input.faqs,
        }),
      );
      expect(result).toEqual(testArticle);
    });

    it('should create article with empty tags and faqs when not provided', async () => {
      // Arrange
      const input = {
        title: 'Simple Article',
        excerpt: 'Excerpt',
        content: '<p>Content</p>',
        category: 'news' as const,
      };
      vi.mocked(articlesRepository.create).mockResolvedValue(testArticleNoRelations);

      // Act
      await articlesService.createArticle(input, 'user-id-1');

      // Assert
      expect(articlesRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tagIds: [],
          faqs: [],
        }),
      );
    });
  });

  describe('updateArticle', () => {
    it('should update article tags and faqs (replace-all)', async () => {
      // Arrange
      const newTags = ['tag-3'];
      const newFaqs = [
        {
          question: { ka: 'ახალი?', ru: '', en: 'New?' },
          answer: { ka: 'ახალი პასუხი', ru: '', en: 'New answer' },
          sortOrder: 0,
        },
      ];
      vi.mocked(articlesRepository.existsById).mockResolvedValue(true);
      vi.mocked(articlesRepository.update).mockResolvedValue({
        ...testArticle,
        tags: [{ id: 'tag-3', slug: 'new-tag', name: { ka: 'ახალი', ru: '', en: '' } }],
        faqs: [{ id: 'faq-2', ...newFaqs[0] }],
      });

      // Act
      const result = await articlesService.updateArticle('article-id-1', {
        tagIds: newTags,
        faqs: newFaqs,
      });

      // Assert
      expect(articlesRepository.update).toHaveBeenCalledWith(
        'article-id-1',
        expect.objectContaining({
          tagIds: newTags,
          faqs: newFaqs,
        }),
      );
      expect(result.tags).toHaveLength(1);
      expect(result.tags[0].id).toBe('tag-3');
    });

    it('should not touch tags/faqs when not provided in update', async () => {
      // Arrange
      vi.mocked(articlesRepository.existsById).mockResolvedValue(true);
      vi.mocked(articlesRepository.update).mockResolvedValue(testArticle);

      // Act
      await articlesService.updateArticle('article-id-1', { title: 'Updated Title' });

      // Assert
      expect(articlesRepository.update).toHaveBeenCalledWith(
        'article-id-1',
        expect.objectContaining({
          title: 'Updated Title',
          tagIds: undefined,
          faqs: undefined,
        }),
      );
    });

    it('should throw NotFoundError if article does not exist', async () => {
      // Arrange
      vi.mocked(articlesRepository.existsById).mockResolvedValue(false);

      // Act & Assert
      await expect(
        articlesService.updateArticle('nonexistent', { tagIds: [] }),
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw ConflictError if slug already exists', async () => {
      // Arrange
      vi.mocked(articlesRepository.existsById).mockResolvedValue(true);
      vi.mocked(articlesRepository.findById).mockResolvedValue(testArticle);
      vi.mocked(articlesRepository.existsBySlug).mockResolvedValue(true);

      // Act & Assert
      await expect(
        articlesService.updateArticle('article-id-1', { slug: 'taken-slug' }),
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('deleteArticle', () => {
    it('should delete article and its tags/faqs cascade', async () => {
      // Arrange
      vi.mocked(articlesRepository.existsById).mockResolvedValue(true);
      vi.mocked(articlesRepository.delete).mockResolvedValue(undefined);

      // Act
      await articlesService.deleteArticle('article-id-1');

      // Assert
      expect(articlesRepository.delete).toHaveBeenCalledWith('article-id-1');
    });

    it('should throw NotFoundError if article does not exist', async () => {
      // Arrange
      vi.mocked(articlesRepository.existsById).mockResolvedValue(false);

      // Act & Assert
      await expect(articlesService.deleteArticle('nonexistent')).rejects.toThrow(NotFoundError);
    });
  });
});
