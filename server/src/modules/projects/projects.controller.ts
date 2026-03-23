/**
 * Projects Controller
 *
 * Request handlers for project endpoints.
 */

import type { FastifyRequest, FastifyReply } from 'fastify';
import { projectsService } from './projects.service.js';
import { successResponse } from '@shared/responses/successResponse.js';
import { paginatedResponse } from '@shared/responses/paginatedResponse.js';
import { BadRequestError } from '@shared/errors/errors.js';
import {
  ProjectIdParamSchema,
  ProjectSlugParamSchema,
  PublicProjectsQuerySchema,
  AdminProjectsQuerySchema,
  CreateProjectSchema,
  UpdateProjectSchema,
} from './projects.schemas.js';

class ProjectsController {
  // ── Public Endpoints ──────────────────────────────

  async getActiveProjects(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { page, limit, type } = PublicProjectsQuerySchema.parse(request.query);
    const result = await projectsService.getActiveProjects(page, limit, type);
    return reply.send(paginatedResponse(
      'Active projects retrieved successfully',
      result.items,
      page,
      limit,
      result.totalItems,
    ));
  }

  async getProjectBySlug(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { slug } = ProjectSlugParamSchema.parse(request.params);
    const project = await projectsService.getProjectBySlug(slug);
    return reply.send(successResponse('Project retrieved successfully', project));
  }

  async getProject(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = ProjectIdParamSchema.parse(request.params);
    const project = await projectsService.getProject(id);
    return reply.send(successResponse('Project retrieved successfully', project));
  }

  // ── Admin Endpoints ───────────────────────────────

  async getAllProjects(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { page, limit, isActive } = AdminProjectsQuerySchema.parse(request.query);
    const result = await projectsService.getAllProjects(page, limit, isActive);
    return reply.send(paginatedResponse(
      'Projects retrieved successfully',
      result.items,
      page,
      limit,
      result.totalItems,
    ));
  }

  async createProject(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const input = CreateProjectSchema.parse(request.body);
    const project = await projectsService.createProject(input);
    return reply.status(201).send(successResponse('Project created successfully', project));
  }

  async updateProject(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = ProjectIdParamSchema.parse(request.params);
    const input = UpdateProjectSchema.parse(request.body);
    const project = await projectsService.updateProject(id, input);
    return reply.send(successResponse('Project updated successfully', project));
  }

  async deleteProject(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = ProjectIdParamSchema.parse(request.params);
    await projectsService.deleteProject(id);
    return reply.send(successResponse('Project deleted successfully', null));
  }

  async uploadImage(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = ProjectIdParamSchema.parse(request.params);
    const file = await request.file();
    if (!file) {
      throw new BadRequestError('No file uploaded', 'NO_FILE');
    }
    const project = await projectsService.uploadProjectImage(id, file);
    return reply.send(successResponse('Project image uploaded successfully', project));
  }

  async uploadVideo(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = ProjectIdParamSchema.parse(request.params);
    const file = await request.file();
    if (!file) {
      throw new BadRequestError('No file uploaded', 'NO_FILE');
    }
    const project = await projectsService.uploadProjectVideo(id, file);
    return reply.send(successResponse('Project video uploaded successfully', project));
  }

  async uploadContentImage(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = ProjectIdParamSchema.parse(request.params);
    const file = await request.file();
    if (!file) {
      throw new BadRequestError('No file uploaded', 'NO_FILE');
    }
    const result = await projectsService.uploadContentImage(id, file);
    return reply.send(successResponse('Content image uploaded successfully', result));
  }
}

export const projectsController = new ProjectsController();
