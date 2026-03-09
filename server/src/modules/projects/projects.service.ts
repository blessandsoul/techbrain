/**
 * Projects Module — Service
 *
 * Business logic for completed projects portfolio.
 */

import { NotFoundError } from '@shared/errors/errors.js';
import { projectsRepository } from './projects.repo.js';
import { fileStorageService } from '@libs/storage/file-storage.service.js';
import { imageOptimizerService } from '@libs/storage/image-optimizer.service.js';
import { validateImageFile, validateFileSize } from '@libs/storage/file-validator.js';
import type { MultipartFile } from '@fastify/multipart';
import type {
  ProjectResponse,
  CreateProjectInput,
  UpdateProjectInput,
} from './projects.types.js';

class ProjectsService {
  // ── Public Read ───────────────────────────────────

  async getActiveProjects(limit: number = 10): Promise<ProjectResponse[]> {
    return projectsRepository.findActiveOrdered(limit);
  }

  async getProject(id: string): Promise<ProjectResponse> {
    const project = await projectsRepository.findById(id);
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
    return projectsRepository.create({
      titleKa: input.title.ka,
      titleRu: input.title.ru ?? '',
      titleEn: input.title.en ?? '',
      locationKa: input.location.ka,
      locationRu: input.location.ru ?? '',
      locationEn: input.location.en ?? '',
      type: input.type,
      cameras: input.cameras,
      image: input.image,
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

    return projectsRepository.update(id, {
      titleKa: input.title?.ka,
      titleRu: input.title?.ru,
      titleEn: input.title?.en,
      locationKa: input.location?.ka,
      locationRu: input.location?.ru,
      locationEn: input.location?.en,
      type: input.type,
      cameras: input.cameras,
      image: input.image,
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

  // ── Image Upload ──────────────────────────────────

  async uploadProjectImage(id: string, file: MultipartFile): Promise<ProjectResponse> {
    const project = await projectsRepository.findById(id);
    if (!project) {
      throw new NotFoundError('Project not found', 'PROJECT_NOT_FOUND');
    }

    // Validate file
    validateImageFile(file);
    const buffer = await file.toBuffer();
    validateFileSize(buffer);

    // Optimize image
    const optimized = await imageOptimizerService.optimizeProjectImage(buffer);

    // Delete old image if exists
    if (project.image) {
      await fileStorageService.deleteProjectImage(id);
    }

    // Save new image
    const { url } = await fileStorageService.saveProjectImage(id, optimized);

    // Update project record with new image URL
    return projectsRepository.update(id, { image: url });
  }
}

export const projectsService = new ProjectsService();
