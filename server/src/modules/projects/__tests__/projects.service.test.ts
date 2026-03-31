import { describe, it, expect, vi, beforeEach } from 'vitest';
import { projectsService } from '../projects.service.js';
import { projectsRepository } from '../projects.repo.js';
import { NotFoundError, ConflictError } from '@shared/errors/errors.js';
import { resetMocks } from '@/test/setup.js';

// Mock dependencies
vi.mock('../projects.repo.js');
vi.mock('@libs/slugify.js', () => ({
  generateUniqueSlug: vi.fn().mockResolvedValue('test-project-slug'),
}));
vi.mock('@libs/storage/file-storage.service.js', () => ({
  fileStorageService: {
    deleteProjectDir: vi.fn().mockResolvedValue(undefined),
    deleteProjectImage: vi.fn().mockResolvedValue(undefined),
    deleteProjectVideo: vi.fn().mockResolvedValue(undefined),
    saveProjectImage: vi.fn().mockResolvedValue({ url: '/uploads/image.webp' }),
    saveProjectVideo: vi.fn().mockResolvedValue({ url: '/uploads/video.mp4' }),
    saveProjectContentImage: vi.fn().mockResolvedValue({ url: '/uploads/content.webp' }),
  },
}));
vi.mock('@libs/storage/image-optimizer.service.js', () => ({
  imageOptimizerService: {
    optimizeProjectImage: vi.fn().mockResolvedValue(Buffer.from('optimized')),
    optimizeProjectContentImage: vi.fn().mockResolvedValue(Buffer.from('optimized')),
  },
}));
vi.mock('@libs/storage/file-validator.js');
vi.mock('@libs/storage/video-validator.js');

// ── Test Fixtures ──────────────────────────────────────

const testProject = {
  id: 'project-id-1',
  slug: 'test-project',
  title: { ka: 'ტესტ პროექტი', ru: '', en: 'Test Project' },
  excerpt: { ka: '', ru: '', en: '' },
  location: { ka: 'თბილისი', ru: '', en: 'Tbilisi' },
  type: 'commercial' as const,
  cameras: 16,
  image: null,
  videoUrl: null,
  content: '',
  year: '2025',
  isActive: true,
  sortOrder: 0,
  tags: [
    { id: 'tag-1', slug: 'security', name: { ka: 'უსაფრთხოება', ru: '', en: 'Security' } },
  ],
  faqs: [
    {
      id: 'faq-1',
      question: { ka: 'რა სისტემა?', ru: '', en: 'What system?' },
      answer: { ka: '16 კამერა', ru: '', en: '16 cameras' },
      sortOrder: 0,
    },
  ],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const testProjectNoRelations = {
  ...testProject,
  tags: [],
  faqs: [],
};

// ── Tests ──────────────────────────────────────────────

describe('Projects Service', () => {
  beforeEach(() => {
    resetMocks();
    vi.clearAllMocks();
  });

  describe('getActiveProjects', () => {
    it('should return paginated active projects with tags and faqs', async () => {
      // Arrange
      vi.mocked(projectsRepository.findActivePaginated).mockResolvedValue({
        items: [testProject],
        totalItems: 1,
      });

      // Act
      const result = await projectsService.getActiveProjects(1, 10);

      // Assert
      expect(projectsRepository.findActivePaginated).toHaveBeenCalledWith(1, 10, undefined, undefined);
      expect(result.items[0].tags).toHaveLength(1);
      expect(result.items[0].faqs).toHaveLength(1);
      expect(result.items[0].tags[0].slug).toBe('security');
      expect(result.items[0].faqs[0].question.ka).toBe('რა სისტემა?');
    });

    it('should pass type filter', async () => {
      // Arrange
      vi.mocked(projectsRepository.findActivePaginated).mockResolvedValue({ items: [], totalItems: 0 });

      // Act
      await projectsService.getActiveProjects(1, 10, 'residential');

      // Assert
      expect(projectsRepository.findActivePaginated).toHaveBeenCalledWith(1, 10, 'residential', undefined);
    });
  });

  describe('getProjectBySlug', () => {
    it('should return project with tags and faqs', async () => {
      // Arrange
      vi.mocked(projectsRepository.findBySlug).mockResolvedValue(testProject);

      // Act
      const result = await projectsService.getProjectBySlug('test-project');

      // Assert
      expect(result.tags).toHaveLength(1);
      expect(result.faqs).toHaveLength(1);
    });

    it('should throw NotFoundError if project not found', async () => {
      // Arrange
      vi.mocked(projectsRepository.findBySlug).mockResolvedValue(null);

      // Act & Assert
      await expect(projectsService.getProjectBySlug('nonexistent')).rejects.toThrow(NotFoundError);
    });
  });

  describe('createProject', () => {
    it('should create project with tags and faqs', async () => {
      // Arrange
      const input = {
        title: { ka: 'ახალი', ru: '', en: 'New' },
        location: { ka: 'ბათუმი', ru: '', en: 'Batumi' },
        type: 'residential' as const,
        cameras: 8,
        year: '2025',
        tagIds: ['tag-1', 'tag-2'],
        faqs: [
          {
            question: { ka: 'კითხვა?', en: 'Q?' },
            answer: { ka: 'პასუხი', en: 'A' },
            sortOrder: 0,
          },
        ],
      };
      vi.mocked(projectsRepository.create).mockResolvedValue(testProject);

      // Act
      const result = await projectsService.createProject(input);

      // Assert
      expect(projectsRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tagIds: ['tag-1', 'tag-2'],
          faqs: input.faqs,
        }),
      );
      expect(result).toEqual(testProject);
    });

    it('should create project with empty tags and faqs when not provided', async () => {
      // Arrange
      const input = {
        title: { ka: 'პროექტი', ru: '', en: 'Project' },
        location: { ka: 'თბილისი', ru: '', en: 'Tbilisi' },
        type: 'commercial' as const,
        cameras: 4,
        year: '2025',
      };
      vi.mocked(projectsRepository.create).mockResolvedValue(testProjectNoRelations);

      // Act
      await projectsService.createProject(input);

      // Assert
      expect(projectsRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tagIds: [],
          faqs: [],
        }),
      );
    });
  });

  describe('updateProject', () => {
    it('should update project tags and faqs (replace-all)', async () => {
      // Arrange
      const newFaqs = [
        {
          question: { ka: 'ახალი?', en: 'New?' },
          answer: { ka: 'ახალი პასუხი', en: 'New answer' },
          sortOrder: 0,
        },
      ];
      vi.mocked(projectsRepository.existsById).mockResolvedValue(true);
      vi.mocked(projectsRepository.update).mockResolvedValue({
        ...testProject,
        tags: [],
        faqs: [{ id: 'faq-2', question: { ka: 'ახალი?', ru: '', en: 'New?' }, answer: { ka: 'ახალი პასუხი', ru: '', en: 'New answer' }, sortOrder: 0 }],
      });

      // Act
      const result = await projectsService.updateProject('project-id-1', {
        tagIds: [],
        faqs: newFaqs,
      });

      // Assert
      expect(projectsRepository.update).toHaveBeenCalledWith(
        'project-id-1',
        expect.objectContaining({
          tagIds: [],
          faqs: newFaqs,
        }),
      );
      expect(result.tags).toHaveLength(0);
      expect(result.faqs).toHaveLength(1);
    });

    it('should not touch tags/faqs when not provided in update', async () => {
      // Arrange
      vi.mocked(projectsRepository.existsById).mockResolvedValue(true);
      vi.mocked(projectsRepository.update).mockResolvedValue(testProject);

      // Act
      await projectsService.updateProject('project-id-1', { cameras: 32 });

      // Assert
      expect(projectsRepository.update).toHaveBeenCalledWith(
        'project-id-1',
        expect.objectContaining({
          cameras: 32,
          tagIds: undefined,
          faqs: undefined,
        }),
      );
    });

    it('should throw NotFoundError if project does not exist', async () => {
      // Arrange
      vi.mocked(projectsRepository.existsById).mockResolvedValue(false);

      // Act & Assert
      await expect(
        projectsService.updateProject('nonexistent', { tagIds: [] }),
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw ConflictError if slug already exists', async () => {
      // Arrange
      vi.mocked(projectsRepository.existsById).mockResolvedValue(true);
      vi.mocked(projectsRepository.findById).mockResolvedValue(testProject);
      vi.mocked(projectsRepository.existsBySlug).mockResolvedValue(true);

      // Act & Assert
      await expect(
        projectsService.updateProject('project-id-1', { slug: 'taken-slug' }),
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('deleteProject', () => {
    it('should delete project (tags/faqs cascade via DB)', async () => {
      // Arrange
      vi.mocked(projectsRepository.existsById).mockResolvedValue(true);
      vi.mocked(projectsRepository.delete).mockResolvedValue(undefined);

      // Act
      await projectsService.deleteProject('project-id-1');

      // Assert
      expect(projectsRepository.delete).toHaveBeenCalledWith('project-id-1');
    });

    it('should throw NotFoundError if project does not exist', async () => {
      // Arrange
      vi.mocked(projectsRepository.existsById).mockResolvedValue(false);

      // Act & Assert
      await expect(projectsService.deleteProject('nonexistent')).rejects.toThrow(NotFoundError);
    });
  });
});
