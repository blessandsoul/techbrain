/**
 * Inquiries Module — Controller
 *
 * Request handlers for inquiry endpoints.
 */

import type { FastifyRequest, FastifyReply } from 'fastify';
import { inquiriesService } from './inquiries.service.js';
import { successResponse } from '@shared/responses/successResponse.js';
import { paginatedResponse } from '@shared/responses/paginatedResponse.js';
import {
  InquiryIdParamSchema,
  CreateInquirySchema,
  AdminInquiriesQuerySchema,
} from './inquiries.schemas.js';

class InquiriesController {
  async getAll(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { page, limit, search } = AdminInquiriesQuerySchema.parse(request.query);
    const result = await inquiriesService.getAllInquiries(page, limit, { search });
    return reply.send(paginatedResponse(
      'Inquiries retrieved successfully',
      result.items,
      page,
      limit,
      result.totalItems,
    ));
  }

  async create(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const input = CreateInquirySchema.parse(request.body);
    const inquiry = await inquiriesService.createInquiry(input);
    return reply.status(201).send(successResponse('Inquiry created successfully', inquiry));
  }

  async remove(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = InquiryIdParamSchema.parse(request.params);
    await inquiriesService.deleteInquiry(id);
    return reply.send(successResponse('Inquiry deleted successfully', null));
  }
}

export const inquiriesController = new InquiriesController();
