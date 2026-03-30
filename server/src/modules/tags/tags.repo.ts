/**
 * Tags Module — Repository
 *
 * Prisma queries for tags.
 */

import { prisma } from '@libs/prisma.js';
import type { Tag } from '@prisma/client';
import type { TagResponse } from './tags.types.js';

// ── DB → Response Mapper ────────────────────────────────

function toTagResponse(t: Tag): TagResponse {
  return {
    id: t.id,
    slug: t.slug,
    name: { ka: t.nameKa, ru: t.nameRu, en: t.nameEn },
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  };
}

// ── Repository ──────────────────────────────────────────

class TagsRepository {
  async findAll(search?: string): Promise<TagResponse[]> {
    const where = search
      ? {
          OR: [
            { nameKa: { contains: search } },
            { nameRu: { contains: search } },
            { nameEn: { contains: search } },
          ],
        }
      : {};

    const rows = await prisma.tag.findMany({
      where,
      orderBy: { nameKa: 'asc' },
    });

    return rows.map(toTagResponse);
  }

  async findById(id: string): Promise<TagResponse | null> {
    const row = await prisma.tag.findUnique({ where: { id } });
    return row ? toTagResponse(row) : null;
  }

  async findByIds(ids: string[]): Promise<TagResponse[]> {
    const rows = await prisma.tag.findMany({
      where: { id: { in: ids } },
    });
    return rows.map(toTagResponse);
  }

  async existsBySlug(slug: string): Promise<boolean> {
    const count = await prisma.tag.count({ where: { slug } });
    return count > 0;
  }

  async create(data: {
    slug: string;
    nameKa: string;
    nameRu: string;
    nameEn: string;
  }): Promise<TagResponse> {
    const row = await prisma.tag.create({ data });
    return toTagResponse(row);
  }

  async update(id: string, data: {
    nameKa?: string;
    nameRu?: string;
    nameEn?: string;
  }): Promise<TagResponse> {
    const updateData: Record<string, unknown> = {};
    if (data.nameKa !== undefined) updateData.nameKa = data.nameKa;
    if (data.nameRu !== undefined) updateData.nameRu = data.nameRu;
    if (data.nameEn !== undefined) updateData.nameEn = data.nameEn;

    const row = await prisma.tag.update({
      where: { id },
      data: updateData,
    });
    return toTagResponse(row);
  }

  async delete(id: string): Promise<void> {
    await prisma.tag.delete({ where: { id } });
  }

  async existsById(id: string): Promise<boolean> {
    const count = await prisma.tag.count({ where: { id } });
    return count > 0;
  }
}

export const tagsRepository = new TagsRepository();
