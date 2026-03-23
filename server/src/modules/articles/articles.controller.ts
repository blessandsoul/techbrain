/**
 * Articles Controller
 *
 * Request handlers for article endpoints.
 */

import type { FastifyRequest, FastifyReply } from 'fastify';
import { articlesService } from './articles.service.js';
import { successResponse } from '@shared/responses/successResponse.js';
import { paginatedResponse } from '@shared/responses/paginatedResponse.js';
import { BadRequestError } from '@shared/errors/errors.js';
import {
  ArticleIdParamSchema,
  ArticleSlugParamSchema,
  PublicArticlesQuerySchema,
  AdminArticlesQuerySchema,
  CreateArticleSchema,
  UpdateArticleSchema,
} from './articles.schemas.js';

class ArticlesController {
  // ── Public Endpoints ──────────────────────────────

  async getPublished(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { page, limit, category } = PublicArticlesQuerySchema.parse(request.query);
    const result = await articlesService.getPublishedArticles(page, limit, category);
    return reply.send(paginatedResponse(
      'Published articles retrieved successfully',
      result.items,
      page,
      limit,
      result.totalItems,
    ));
  }

  async getBySlug(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { slug } = ArticleSlugParamSchema.parse(request.params);
    const article = await articlesService.getArticleBySlug(slug);
    return reply.send(successResponse('Article retrieved successfully', article));
  }

  // ── Admin Endpoints ───────────────────────────────

  async getAll(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { page, limit, isPublished, category } = AdminArticlesQuerySchema.parse(request.query);
    const result = await articlesService.getAllArticles(page, limit, { isPublished, category });
    return reply.send(paginatedResponse(
      'Articles retrieved successfully',
      result.items,
      page,
      limit,
      result.totalItems,
    ));
  }

  async getById(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = ArticleIdParamSchema.parse(request.params);
    const article = await articlesService.getArticle(id);
    return reply.send(successResponse('Article retrieved successfully', article));
  }

  async create(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const input = CreateArticleSchema.parse(request.body);
    const article = await articlesService.createArticle(input, request.user.userId);
    return reply.status(201).send(successResponse('Article created successfully', article));
  }

  async update(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = ArticleIdParamSchema.parse(request.params);
    const input = UpdateArticleSchema.parse(request.body);
    const article = await articlesService.updateArticle(id, input);
    return reply.send(successResponse('Article updated successfully', article));
  }

  async remove(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = ArticleIdParamSchema.parse(request.params);
    await articlesService.deleteArticle(id);
    return reply.send(successResponse('Article deleted successfully', null));
  }

  async uploadCover(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = ArticleIdParamSchema.parse(request.params);
    const file = await request.file();
    if (!file) {
      throw new BadRequestError('No file uploaded', 'NO_FILE');
    }
    const article = await articlesService.uploadCoverImage(id, file);
    return reply.send(successResponse('Article cover image uploaded successfully', article));
  }

  async uploadVideo(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = ArticleIdParamSchema.parse(request.params);
    const file = await request.file();
    if (!file) {
      throw new BadRequestError('No file uploaded', 'NO_FILE');
    }
    const article = await articlesService.uploadVideo(id, file);
    return reply.send(successResponse('Article video uploaded successfully', article));
  }

  async uploadContentImage(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = ArticleIdParamSchema.parse(request.params);
    const file = await request.file();
    if (!file) {
      throw new BadRequestError('No file uploaded', 'NO_FILE');
    }
    const result = await articlesService.uploadContentImage(id, file);
    return reply.send(successResponse('Content image uploaded successfully', result));
  }

  async togglePublished(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = ArticleIdParamSchema.parse(request.params);
    const article = await articlesService.togglePublished(id);
    return reply.send(successResponse('Article publish status toggled successfully', article));
  }
}

export const articlesController = new ArticlesController();
