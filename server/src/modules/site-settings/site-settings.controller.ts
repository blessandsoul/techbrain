/**
 * Site Settings Controller
 *
 * Request handlers for site settings endpoints.
 */

import type { FastifyRequest, FastifyReply } from 'fastify';
import { siteSettingsService } from './site-settings.service.js';
import { successResponse } from '@shared/responses/successResponse.js';
import { UpdateSiteSettingsSchema } from './site-settings.schemas.js';

class SiteSettingsController {
  async getSettings(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const settings = await siteSettingsService.getSettings();
    return reply.send(successResponse('Site settings retrieved successfully', settings));
  }

  async updateSettings(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const input = UpdateSiteSettingsSchema.parse(request.body);
    const settings = await siteSettingsService.updateSettings(input);
    return reply.send(successResponse('Site settings updated successfully', settings));
  }
}

export const siteSettingsController = new SiteSettingsController();
