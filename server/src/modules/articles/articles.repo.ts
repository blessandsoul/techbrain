/**
 * Articles Module — Repository
 *
 * Prisma queries for articles.
 */

import { prisma } from '@libs/prisma.js';
import type { Article } from '@prisma/client';
import type { ArticleResponse } from './articles.types.js';

// ── DB → Response Mapper ────────────────────────────────

function toArticleResponse(a: Article): ArticleResponse {
  return {
    id: a.id,
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    content: a.content,
    category: a.category as ArticleResponse['category'],
    coverImage: a.coverImage,
    videoUrl: a.videoUrl,
    isPublished: a.isPublished,
    readMin: a.readMin,
    authorId: a.authorId,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  };
}

// ── Repository ──────────────────────────────────────────

class ArticlesRepository {
  // ── Public Queries ──────────────────────────────────

  async findPublishedPaginated(
    page: number,
    limit: number,
    category?: string,
  ): Promise<{ items: ArticleResponse[]; totalItems: number }> {
    const where: Record<string, unknown> = { isPublished: true };
    if (category) where.category = category;

    const [rows, totalItems] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.article.count({ where }),
    ]);

    return {
      items: rows.map(toArticleResponse),
      totalItems,
    };
  }

  async findBySlug(slug: string): Promise<ArticleResponse | null> {
    const row = await prisma.article.findUnique({
      where: { slug },
    });
    if (!row || !row.isPublished) return null;
    return toArticleResponse(row);
  }

  // ── Admin Queries ───────────────────────────────────

  async findAllPaginated(
    page: number,
    limit: number,
    filters?: { isPublished?: boolean; category?: string },
  ): Promise<{ items: ArticleResponse[]; totalItems: number }> {
    const where: Record<string, unknown> = {};
    if (filters?.isPublished !== undefined) where.isPublished = filters.isPublished;
    if (filters?.category) where.category = filters.category;

    const [rows, totalItems] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.article.count({ where }),
    ]);

    return {
      items: rows.map(toArticleResponse),
      totalItems,
    };
  }

  async findById(id: string): Promise<ArticleResponse | null> {
    const row = await prisma.article.findUnique({ where: { id } });
    return row ? toArticleResponse(row) : null;
  }

  // ── Mutations ───────────────────────────────────────

  async create(data: {
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    category: string;
    readMin: number;
    isPublished: boolean;
    authorId: string;
  }): Promise<ArticleResponse> {
    const row = await prisma.article.create({ data });
    return toArticleResponse(row);
  }

  async update(id: string, data: {
    slug?: string;
    title?: string;
    excerpt?: string;
    content?: string;
    category?: string;
    coverImage?: string | null;
    videoUrl?: string | null;
    readMin?: number;
    isPublished?: boolean;
  }): Promise<ArticleResponse> {
    const updateData: Record<string, unknown> = {};
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.title !== undefined) updateData.title = data.title;
    if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.coverImage !== undefined) updateData.coverImage = data.coverImage;
    if (data.videoUrl !== undefined) updateData.videoUrl = data.videoUrl;
    if (data.readMin !== undefined) updateData.readMin = data.readMin;
    if (data.isPublished !== undefined) updateData.isPublished = data.isPublished;

    const row = await prisma.article.update({
      where: { id },
      data: updateData,
    });
    return toArticleResponse(row);
  }

  async delete(id: string): Promise<void> {
    await prisma.article.delete({ where: { id } });
  }

  async existsById(id: string): Promise<boolean> {
    const count = await prisma.article.count({ where: { id } });
    return count > 0;
  }

  async existsBySlug(slug: string): Promise<boolean> {
    const count = await prisma.article.count({ where: { slug } });
    return count > 0;
  }
}

export const articlesRepository = new ArticlesRepository();
