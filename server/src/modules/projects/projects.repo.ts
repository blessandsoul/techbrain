/**
 * Projects Module — Repository
 *
 * Prisma queries for projects.
 */

import { prisma } from '@libs/prisma.js';
import type { Project } from '@prisma/client';
import type { ProjectResponse } from './projects.types.js';

// ── DB → Response Mapper ────────────────────────────────

function toProjectResponse(p: Project): ProjectResponse {
  return {
    id: p.id,
    title: { ka: p.titleKa, ru: p.titleRu, en: p.titleEn },
    location: { ka: p.locationKa, ru: p.locationRu, en: p.locationEn },
    type: p.type as ProjectResponse['type'],
    cameras: p.cameras,
    image: p.image,
    year: p.year,
    isActive: p.isActive,
    sortOrder: p.sortOrder,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

// ── Repository ──────────────────────────────────────────

class ProjectsRepository {
  async findActiveOrdered(limit: number = 10): Promise<ProjectResponse[]> {
    const rows = await prisma.project.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      take: limit,
    });
    return rows.map(toProjectResponse);
  }

  async findAllPaginated(
    page: number,
    limit: number,
    isActive?: boolean,
  ): Promise<{ items: ProjectResponse[]; totalItems: number }> {
    const where = isActive !== undefined ? { isActive } : {};

    const [rows, totalItems] = await Promise.all([
      prisma.project.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.project.count({ where }),
    ]);

    return {
      items: rows.map(toProjectResponse),
      totalItems,
    };
  }

  async findById(id: string): Promise<ProjectResponse | null> {
    const row = await prisma.project.findUnique({ where: { id } });
    return row ? toProjectResponse(row) : null;
  }

  async create(data: {
    titleKa: string;
    titleRu: string;
    titleEn: string;
    locationKa: string;
    locationRu: string;
    locationEn: string;
    type: string;
    cameras: number;
    image?: string;
    year: string;
    isActive: boolean;
    sortOrder: number;
  }): Promise<ProjectResponse> {
    const row = await prisma.project.create({
      data: {
        titleKa: data.titleKa,
        titleRu: data.titleRu,
        titleEn: data.titleEn,
        locationKa: data.locationKa,
        locationRu: data.locationRu,
        locationEn: data.locationEn,
        type: data.type,
        cameras: data.cameras,
        image: data.image ?? null,
        year: data.year,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
      },
    });
    return toProjectResponse(row);
  }

  async update(id: string, data: {
    titleKa?: string;
    titleRu?: string;
    titleEn?: string;
    locationKa?: string;
    locationRu?: string;
    locationEn?: string;
    type?: string;
    cameras?: number;
    image?: string | null;
    year?: string;
    isActive?: boolean;
    sortOrder?: number;
  }): Promise<ProjectResponse> {
    const updateData: Record<string, unknown> = {};
    if (data.titleKa !== undefined) updateData.titleKa = data.titleKa;
    if (data.titleRu !== undefined) updateData.titleRu = data.titleRu;
    if (data.titleEn !== undefined) updateData.titleEn = data.titleEn;
    if (data.locationKa !== undefined) updateData.locationKa = data.locationKa;
    if (data.locationRu !== undefined) updateData.locationRu = data.locationRu;
    if (data.locationEn !== undefined) updateData.locationEn = data.locationEn;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.cameras !== undefined) updateData.cameras = data.cameras;
    if (data.image !== undefined) updateData.image = data.image;
    if (data.year !== undefined) updateData.year = data.year;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;

    const row = await prisma.project.update({
      where: { id },
      data: updateData,
    });
    return toProjectResponse(row);
  }

  async delete(id: string): Promise<void> {
    await prisma.project.delete({ where: { id } });
  }

  async existsById(id: string): Promise<boolean> {
    const count = await prisma.project.count({ where: { id } });
    return count > 0;
  }
}

export const projectsRepository = new ProjectsRepository();
