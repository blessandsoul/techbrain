/**
 * Tags Controller
 *
 * Request handlers for tag endpoints.
 */

import type { FastifyRequest, FastifyReply } from 'fastify';
import { tagsService } from './tags.service.js';
import { successResponse } from '@shared/responses/successResponse.js';
import {
  TagIdParamSchema,
  TagsQuerySchema,
  CreateTagSchema,
  UpdateTagSchema,
} from './tags.schemas.js';

class TagsController {
  async getAll(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { search } = TagsQuerySchema.parse(request.query);
    const tags = await tagsService.getAllTags(search);
    return reply.send(successResponse('Tags retrieved successfully', tags));
  }

  async create(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const input = CreateTagSchema.parse(request.body);
    const tag = await tagsService.createTag(input);
    return reply.status(201).send(successResponse('Tag created successfully', tag));
  }

  async update(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = TagIdParamSchema.parse(request.params);
    const input = UpdateTagSchema.parse(request.body);
    const tag = await tagsService.updateTag(id, input);
    return reply.send(successResponse('Tag updated successfully', tag));
  }

  async remove(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = TagIdParamSchema.parse(request.params);
    await tagsService.deleteTag(id);
    return reply.send(successResponse('Tag deleted successfully', null));
  }
}

export const tagsController = new TagsController();
