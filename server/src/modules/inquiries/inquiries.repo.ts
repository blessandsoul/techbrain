/**
 * Inquiries Module — Repository
 *
 * Prisma queries for inquiries.
 */

import { prisma } from '@libs/prisma.js';
import type { Prisma, Inquiry } from '@prisma/client';
import type { InquiryResponse } from './inquiries.types.js';

// ── DB → Response Mapper ────────────────────────────────

function toInquiryResponse(row: Inquiry): InquiryResponse {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    message: row.message,
    locale: row.locale,
    createdAt: row.createdAt.toISOString(),
  };
}

// ── Repository ──────────────────────────────────────────

class InquiriesRepository {
  async findAllPaginated(
    page: number,
    limit: number,
    filters?: { search?: string },
  ): Promise<{ items: InquiryResponse[]; totalItems: number }> {
    const where: Prisma.InquiryWhereInput = {};

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { phone: { contains: filters.search } },
        { message: { contains: filters.search } },
      ];
    }

    const [rows, totalItems] = await Promise.all([
      prisma.inquiry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.inquiry.count({ where }),
    ]);

    return {
      items: rows.map(toInquiryResponse),
      totalItems,
    };
  }

  async create(data: {
    name: string;
    phone: string;
    message: string;
    locale: string;
  }): Promise<InquiryResponse> {
    const row = await prisma.inquiry.create({ data });
    return toInquiryResponse(row);
  }

  async existsById(id: string): Promise<boolean> {
    const count = await prisma.inquiry.count({ where: { id } });
    return count > 0;
  }

  async deleteById(id: string): Promise<void> {
    await prisma.inquiry.delete({ where: { id } });
  }
}

export const inquiriesRepository = new InquiriesRepository();
