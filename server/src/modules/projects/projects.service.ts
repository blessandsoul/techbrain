/**
 * Projects Module — Service
 *
 * Business logic for completed projects portfolio.
 */

import { NotFoundError, ConflictError } from '@shared/errors/errors.js';
import { generateUniqueSlug } from '@libs/slugify.js';
import { projectsRepository } from './projects.repo.js';
import { fileStorageService } from '@libs/storage/file-storage.service.js';
import { imageOptimizerService } from '@libs/storage/image-optimizer.service.js';
import { validateImageFile, validateFileSize } from '@libs/storage/file-validator.js';
import { validateVideoFile, validateVideoFileSize } from '@libs/storage/video-validator.js';
import type { MultipartFile } from '@fastify/multipart';
import type {
  ProjectResponse,
  CreateProjectInput,
  UpdateProjectInput,
} from './projects.types.js';

class ProjectsService {
  // ── Public Read ───────────────────────────────────

  async getActiveProjects(
    page: number = 1,
    limit: number = 10,
    type?: string,
  ): Promise<{ items: ProjectResponse[]; totalItems: number }> {
    return projectsRepository.findActivePaginated(page, limit, type);
  }

  async getProject(id: string): Promise<ProjectResponse> {
    const project = await projectsRepository.findById(id);
    if (!project) {
      throw new NotFoundError('Project not found', 'PROJECT_NOT_FOUND');
    }
    return project;
  }

  async getProjectBySlug(slug: string): Promise<ProjectResponse> {
    const project = await projectsRepository.findBySlug(slug);
    if (!project) {
      throw new NotFoundError('Project not found', 'PROJECT_NOT_FOUND');
    }
    return project;
  }

  // ── Admin CRUD ────────────────────────────────────

  async getAllProjects(
    page: number,
    limit: number,
    isActive?: boolean,
  ): Promise<{ items: ProjectResponse[]; totalItems: number }> {
    return projectsRepository.findAllPaginated(page, limit, isActive);
  }

  async createProject(input: CreateProjectInput): Promise<ProjectResponse> {
    // Auto-generate slug from title if not provided; resolve conflicts with -2, -3, etc.
    const sourceText = input.slug || input.title.en || input.title.ka;
    const slug = input.slug
      ? await generateUniqueSlug(input.slug, (s) => projectsRepository.existsBySlug(s))
      : await generateUniqueSlug(sourceText, (s) => projectsRepository.existsBySlug(s));

    return projectsRepository.create({
      slug,
      titleKa: input.title.ka,
      titleRu: input.title.ru ?? '',
      titleEn: input.title.en ?? '',
      excerptKa: input.excerpt?.ka ?? '',
      excerptRu: input.excerpt?.ru ?? '',
      excerptEn: input.excerpt?.en ?? '',
      locationKa: input.location.ka,
      locationRu: input.location.ru ?? '',
      locationEn: input.location.en ?? '',
      type: input.type,
      cameras: input.cameras,
      image: input.image,
      content: input.content ?? '',
      year: input.year,
      isActive: input.isActive ?? true,
      sortOrder: input.sortOrder ?? 0,
    });
  }

  async updateProject(id: string, input: UpdateProjectInput): Promise<ProjectResponse> {
    const exists = await projectsRepository.existsById(id);
    if (!exists) {
      throw new NotFoundError('Project not found', 'PROJECT_NOT_FOUND');
    }

    if (input.slug) {
      const project = await projectsRepository.findById(id);
      if (project && project.slug !== input.slug) {
        const slugExists = await projectsRepository.existsBySlug(input.slug);
        if (slugExists) {
          throw new ConflictError('Project with this slug already exists', 'SLUG_ALREADY_EXISTS');
        }
      }
    }

    return projectsRepository.update(id, {
      slug: input.slug,
      titleKa: input.title?.ka,
      titleRu: input.title?.ru,
      titleEn: input.title?.en,
      excerptKa: input.excerpt?.ka,
      excerptRu: input.excerpt?.ru,
      excerptEn: input.excerpt?.en,
      locationKa: input.location?.ka,
      locationRu: input.location?.ru,
      locationEn: input.location?.en,
      type: input.type,
      cameras: input.cameras,
      image: input.image,
      content: input.content,
      year: input.year,
      isActive: input.isActive,
      sortOrder: input.sortOrder,
    });
  }

  async deleteProject(id: string): Promise<void> {
    const exists = await projectsRepository.existsById(id);
    if (!exists) {
      throw new NotFoundError('Project not found', 'PROJECT_NOT_FOUND');
    }

    // Delete associated image files
    await fileStorageService.deleteProjectImage(id);

    await projectsRepository.delete(id);
  }

  // ── Cover Image Upload ──────────────────────────────

  async uploadProjectImage(id: string, file: MultipartFile): Promise<ProjectResponse> {
    const project = await projectsRepository.findById(id);
    if (!project) {
      throw new NotFoundError('Project not found', 'PROJECT_NOT_FOUND');
    }

    validateImageFile(file);
    const buffer = await file.toBuffer();
    validateFileSize(buffer);

    const optimized = await imageOptimizerService.optimizeProjectImage(buffer);

    if (project.image) {
      await fileStorageService.deleteProjectImage(id);
    }

    const { url } = await fileStorageService.saveProjectImage(id, optimized);

    return projectsRepository.update(id, { image: url });
  }

  // ── Video Upload ───────────────────────────────────

  async uploadProjectVideo(id: string, file: MultipartFile): Promise<ProjectResponse> {
    const project = await projectsRepository.findById(id);
    if (!project) {
      throw new NotFoundError('Project not found', 'PROJECT_NOT_FOUND');
    }

    validateVideoFile(file);
    const buffer = await file.toBuffer();
    validateVideoFileSize(buffer);

    const extension = '.' + file.filename.split('.').pop()!.toLowerCase();

    if (project.videoUrl) {
      await fileStorageService.deleteProjectVideo(project.videoUrl);
    }

    const { url } = await fileStorageService.saveProjectVideo(id, buffer, extension);

    return projectsRepository.update(id, { videoUrl: url });
  }

  // ── Content Image Upload ────────────────────────────

  async uploadContentImage(id: string, file: MultipartFile): Promise<{ url: string }> {
    const exists = await projectsRepository.existsById(id);
    if (!exists) {
      throw new NotFoundError('Project not found', 'PROJECT_NOT_FOUND');
    }

    validateImageFile(file);
    const buffer = await file.toBuffer();
    validateFileSize(buffer);

    const optimized = await imageOptimizerService.optimizeProjectContentImage(buffer);
    const { url } = await fileStorageService.saveProjectContentImage(id, optimized);

    return { url };
  }
}

export const projectsService = new ProjectsService();
