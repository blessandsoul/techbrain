/**
 * Articles Module — Repository
 *
 * Prisma queries for articles.
 */

import { prisma } from '@libs/prisma.js';
import type { Article, ArticleTag, Tag, ArticleFaq } from '@prisma/client';
import type { ArticleResponse, FaqInput } from './articles.types.js';

// ── Types for Prisma includes ───────────────────────────

type ArticleWithRelations = Article & {
  tags: (ArticleTag & { tag: Tag })[];
  faqs: ArticleFaq[];
};

// ── Include clause reused across queries ────────────────

const ARTICLE_INCLUDE = {
  tags: {
    include: { tag: true },
    orderBy: { tag: { nameKa: 'asc' as const } },
  },
  faqs: {
    orderBy: { sortOrder: 'asc' as const },
  },
};

// ── DB → Response Mapper ────────────────────────────────

function toArticleResponse(a: ArticleWithRelations): ArticleResponse {
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
    tags: a.tags.map((at) => ({
      id: at.tag.id,
      slug: at.tag.slug,
      name: { ka: at.tag.nameKa, ru: at.tag.nameRu, en: at.tag.nameEn },
    })),
    faqs: a.faqs.map((f) => ({
      id: f.id,
      question: { ka: f.questionKa, ru: f.questionRu, en: f.questionEn },
      answer: { ka: f.answerKa, ru: f.answerRu, en: f.answerEn },
      sortOrder: f.sortOrder,
    })),
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
        include: ARTICLE_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.article.count({ where }),
    ]);

    return {
      items: (rows as ArticleWithRelations[]).map(toArticleResponse),
      totalItems,
    };
  }

  async findBySlug(slug: string): Promise<ArticleResponse | null> {
    const row = await prisma.article.findUnique({
      where: { slug },
      include: ARTICLE_INCLUDE,
    });
    if (!row || !row.isPublished) return null;
    return toArticleResponse(row as ArticleWithRelations);
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
        include: ARTICLE_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.article.count({ where }),
    ]);

    return {
      items: (rows as ArticleWithRelations[]).map(toArticleResponse),
      totalItems,
    };
  }

  async findById(id: string): Promise<ArticleResponse | null> {
    const row = await prisma.article.findUnique({
      where: { id },
      include: ARTICLE_INCLUDE,
    });
    return row ? toArticleResponse(row as ArticleWithRelations) : null;
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
    tagIds: string[];
    faqs: FaqInput[];
  }): Promise<ArticleResponse> {
    const row = await prisma.article.create({
      data: {
        slug: data.slug,
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
        category: data.category,
        readMin: data.readMin,
        isPublished: data.isPublished,
        authorId: data.authorId,
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
      include: ARTICLE_INCLUDE,
    });
    return toArticleResponse(row as ArticleWithRelations);
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
    tagIds?: string[];
    faqs?: FaqInput[];
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

    const row = await prisma.article.update({
      where: { id },
      data: updateData,
      include: ARTICLE_INCLUDE,
    });
    return toArticleResponse(row as ArticleWithRelations);
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
