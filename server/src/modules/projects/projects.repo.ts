/**
 * Projects Module — Repository
 *
 * Prisma queries for projects.
 */

import { prisma } from '@libs/prisma.js';
import type { Project, ProjectTag, Tag, ProjectFaq, Prisma } from '@prisma/client';
import type { ProjectResponse, FaqInput } from './projects.types.js';

// ── Types for Prisma includes ───────────────────────────

type ProjectWithRelations = Project & {
  tags: (ProjectTag & { tag: Tag })[];
  faqs: ProjectFaq[];
};

// ── Include clause reused across queries ────────────────

const PROJECT_INCLUDE = {
  tags: {
    include: { tag: true },
    orderBy: { tag: { nameKa: 'asc' as const } },
  },
  faqs: {
    orderBy: { sortOrder: 'asc' as const },
  },
};

// ── DB → Response Mapper ────────────────────────────────

function toProjectResponse(p: ProjectWithRelations): ProjectResponse {
  return {
    id: p.id,
    slug: p.slug,
    title: { ka: p.titleKa, ru: p.titleRu, en: p.titleEn },
    excerpt: { ka: p.excerptKa, ru: p.excerptRu, en: p.excerptEn },
    location: { ka: p.locationKa, ru: p.locationRu, en: p.locationEn },
    type: p.type as ProjectResponse['type'],
    cameras: p.cameras,
    image: p.image,
    videoUrl: p.videoUrl,
    content: p.content,
    year: p.year,
    isActive: p.isActive,
    sortOrder: p.sortOrder,
    tags: p.tags.map((pt) => ({
      id: pt.tag.id,
      slug: pt.tag.slug,
      name: { ka: pt.tag.nameKa, ru: pt.tag.nameRu, en: pt.tag.nameEn },
    })),
    faqs: p.faqs.map((f) => ({
      id: f.id,
      question: { ka: f.questionKa, ru: f.questionRu, en: f.questionEn },
      answer: { ka: f.answerKa, ru: f.answerRu, en: f.answerEn },
      sortOrder: f.sortOrder,
    })),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

// ── Repository ──────────────────────────────────────────

class ProjectsRepository {
  async findActivePaginated(
    page: number = 1,
    limit: number = 10,
    type?: string,
  ): Promise<{ items: ProjectResponse[]; totalItems: number }> {
    const where: Prisma.ProjectWhereInput = { isActive: true };
    if (type) where.type = type;

    const [rows, totalItems] = await Promise.all([
      prisma.project.findMany({
        where,
        include: PROJECT_INCLUDE,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.project.count({ where }),
    ]);

    return {
      items: (rows as ProjectWithRelations[]).map(toProjectResponse),
      totalItems,
    };
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
        include: PROJECT_INCLUDE,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.project.count({ where }),
    ]);

    return {
      items: (rows as ProjectWithRelations[]).map(toProjectResponse),
      totalItems,
    };
  }

  async findById(id: string): Promise<ProjectResponse | null> {
    const row = await prisma.project.findUnique({
      where: { id },
      include: PROJECT_INCLUDE,
    });
    return row ? toProjectResponse(row as ProjectWithRelations) : null;
  }

  async findBySlug(slug: string): Promise<ProjectResponse | null> {
    const row = await prisma.project.findUnique({
      where: { slug, isActive: true },
      include: PROJECT_INCLUDE,
    });
    return row ? toProjectResponse(row as ProjectWithRelations) : null;
  }

  async existsBySlug(slug: string): Promise<boolean> {
    const count = await prisma.project.count({ where: { slug } });
    return count > 0;
  }

  async create(data: {
    slug: string;
    titleKa: string;
    titleRu: string;
    titleEn: string;
    excerptKa: string;
    excerptRu: string;
    excerptEn: string;
    locationKa: string;
    locationRu: string;
    locationEn: string;
    type: string;
    cameras: number;
    image?: string;
    videoUrl?: string | null;
    content: string;
    year: string;
    isActive: boolean;
    sortOrder: number;
    tagIds: string[];
    faqs: FaqInput[];
  }): Promise<ProjectResponse> {
    const row = await prisma.project.create({
      data: {
        slug: data.slug,
        titleKa: data.titleKa,
        titleRu: data.titleRu,
        titleEn: data.titleEn,
        excerptKa: data.excerptKa,
        excerptRu: data.excerptRu,
        excerptEn: data.excerptEn,
        locationKa: data.locationKa,
        locationRu: data.locationRu,
        locationEn: data.locationEn,
        type: data.type,
        cameras: data.cameras,
        image: data.image ?? null,
        videoUrl: data.videoUrl ?? null,
        content: data.content,
        year: data.year,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
        tags: {
          create: data.tagIds.map((tagId) => ({ tagId })),
        },
        faqs: {
          create: data.faqs.map((faq, index) => ({
            questionKa: faq.question.ka,
            questionRu: faq.question.ru ?? '',
            questionEn: faq.question.en ?? '',
            answerKa: faq.answer.ka,
            answerRu: faq.answer.ru ?? '',
            answerEn: faq.answer.en ?? '',
            sortOrder: faq.sortOrder ?? index,
          })),
        },
      },
      include: PROJECT_INCLUDE,
    });
    return toProjectResponse(row as ProjectWithRelations);
  }

  async update(id: string, data: {
    slug?: string;
    titleKa?: string;
    titleRu?: string;
    titleEn?: string;
    excerptKa?: string;
    excerptRu?: string;
    excerptEn?: string;
    locationKa?: string;
    locationRu?: string;
    locationEn?: string;
    type?: string;
    cameras?: number;
    image?: string | null;
    videoUrl?: string | null;
    content?: string;
    year?: string;
    isActive?: boolean;
    sortOrder?: number;
    tagIds?: string[];
    faqs?: FaqInput[];
  }): Promise<ProjectResponse> {
    const updateData: Record<string, unknown> = {};
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.titleKa !== undefined) updateData.titleKa = data.titleKa;
    if (data.titleRu !== undefined) updateData.titleRu = data.titleRu;
    if (data.titleEn !== undefined) updateData.titleEn = data.titleEn;
    if (data.excerptKa !== undefined) updateData.excerptKa = data.excerptKa;
    if (data.excerptRu !== undefined) updateData.excerptRu = data.excerptRu;
    if (data.excerptEn !== undefined) updateData.excerptEn = data.excerptEn;
    if (data.locationKa !== undefined) updateData.locationKa = data.locationKa;
    if (data.locationRu !== undefined) updateData.locationRu = data.locationRu;
    if (data.locationEn !== undefined) updateData.locationEn = data.locationEn;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.cameras !== undefined) updateData.cameras = data.cameras;
    if (data.image !== undefined) updateData.image = data.image;
    if (data.videoUrl !== undefined) updateData.videoUrl = data.videoUrl;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.year !== undefined) updateData.year = data.year;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;

    // Replace-all for tags if provided
    if (data.tagIds !== undefined) {
      updateData.tags = {
        deleteMany: {},
        create: data.tagIds.map((tagId: string) => ({ tagId })),
      };
    }

    // Replace-all for FAQs if provided
    if (data.faqs !== undefined) {
      updateData.faqs = {
        deleteMany: {},
        create: data.faqs.map((faq: FaqInput, index: number) => ({
          questionKa: faq.question.ka,
          questionRu: faq.question.ru ?? '',
          questionEn: faq.question.en ?? '',
          answerKa: faq.answer.ka,
          answerRu: faq.answer.ru ?? '',
          answerEn: faq.answer.en ?? '',
          sortOrder: faq.sortOrder ?? index,
        })),
      };
    }

    const row = await prisma.project.update({
      where: { id },
      data: updateData,
      include: PROJECT_INCLUDE,
    });
    return toProjectResponse(row as ProjectWithRelations);
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
