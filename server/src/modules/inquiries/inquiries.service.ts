/**
 * Inquiries Module — Service
 *
 * Business logic for inquiry management.
 */

import { NotFoundError } from '@shared/errors/errors.js';
import { sendTelegramMessage, formatInquiryMessage } from '@libs/telegram.js';
import { inquiriesRepository } from './inquiries.repo.js';
import type { InquiryResponse, InquiryFilters } from './inquiries.types.js';
import type { CreateInquiryInput } from './inquiries.schemas.js';

class InquiriesService {
  async getAllInquiries(
    page: number,
    limit: number,
    filters?: InquiryFilters,
  ): Promise<{ items: InquiryResponse[]; totalItems: number }> {
    return inquiriesRepository.findAllPaginated(page, limit, filters);
  }

  async createInquiry(input: CreateInquiryInput): Promise<InquiryResponse> {
    const inquiry = await inquiriesRepository.create({
      name: input.name,
      phone: input.phone,
      message: input.message,
      locale: input.locale,
    });

    // Fire-and-forget Telegram notification — never blocks the response
    void sendTelegramMessage(formatInquiryMessage(inquiry));

    return inquiry;
  }

  async deleteInquiry(id: string): Promise<void> {
    const exists = await inquiriesRepository.existsById(id);
    if (!exists) {
      throw new NotFoundError('Inquiry not found', 'INQUIRY_NOT_FOUND');
    }
    await inquiriesRepository.deleteById(id);
  }
}

export const inquiriesService = new InquiriesService();
