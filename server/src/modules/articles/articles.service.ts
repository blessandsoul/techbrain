/**
 * Articles Module — Service
 *
 * Business logic for blog articles.
 */

import { NotFoundError, ConflictError } from '@shared/errors/errors.js';
import { articlesRepository } from './articles.repo.js';
import { fileStorageService } from '@libs/storage/file-storage.service.js';
import { imageOptimizerService } from '@libs/storage/image-optimizer.service.js';
import { validateImageFile, validateFileSize } from '@libs/storage/file-validator.js';
import type { MultipartFile } from '@fastify/multipart';
import type {
  ArticleResponse,
  CreateArticleInput,
  UpdateArticleInput,
} from './articles.types.js';

class ArticlesService {
  // ── Public Read ───────────────────────────────────

  async getPublishedArticles(
    page: number,
    limit: number,
    category?: string,
  ): Promise<{ items: ArticleResponse[]; totalItems: number }> {
    return articlesRepository.findPublishedPaginated(page, limit, category);
  }

  async getArticleBySlug(slug: string): Promise<ArticleResponse> {
    const article = await articlesRepository.findBySlug(slug);
    if (!article) {
      throw new NotFoundError('Article not found', 'ARTICLE_NOT_FOUND');
    }
    return article;
  }

  // ── Admin CRUD ────────────────────────────────────

  async getAllArticles(
    page: number,
    limit: number,
    filters?: { isPublished?: boolean; category?: string },
  ): Promise<{ items: ArticleResponse[]; totalItems: number }> {
    return articlesRepository.findAllPaginated(page, limit, filters);
  }

  async getArticle(id: string): Promise<ArticleResponse> {
    const article = await articlesRepository.findById(id);
    if (!article) {
      throw new NotFoundError('Article not found', 'ARTICLE_NOT_FOUND');
    }
    return article;
  }

  async createArticle(input: CreateArticleInput, authorId: string): Promise<ArticleResponse> {
    const slugExists = await articlesRepository.existsBySlug(input.slug);
    if (slugExists) {
      throw new ConflictError('Article with this slug already exists', 'SLUG_ALREADY_EXISTS');
    }

    return articlesRepository.create({
      slug: input.slug,
      title: input.title,
      excerpt: input.excerpt,
      content: input.content,
      category: input.category,
      readMin: input.readMin ?? 5,
      isPublished: input.isPublished ?? false,
      authorId,
    });
  }

  async updateArticle(id: string, input: UpdateArticleInput): Promise<ArticleResponse> {
    const exists = await articlesRepository.existsById(id);
    if (!exists) {
      throw new NotFoundError('Article not found', 'ARTICLE_NOT_FOUND');
    }

    if (input.slug) {
      const slugArticle = await articlesRepository.findById(id);
      if (slugArticle && slugArticle.slug !== input.slug) {
        const slugExists = await articlesRepository.existsBySlug(input.slug);
        if (slugExists) {
          throw new ConflictError('Article with this slug already exists', 'SLUG_ALREADY_EXISTS');
        }
      }
    }

    return articlesRepository.update(id, {
      slug: input.slug,
      title: input.title,
      excerpt: input.excerpt,
      content: input.content,
      category: input.category,
      readMin: input.readMin,
      isPublished: input.isPublished,
    });
  }

  async deleteArticle(id: string): Promise<void> {
    const exists = await articlesRepository.existsById(id);
    if (!exists) {
      throw new NotFoundError('Article not found', 'ARTICLE_NOT_FOUND');
    }

    await fileStorageService.deleteArticleCoverImage(id);
    await articlesRepository.delete(id);
  }

  async togglePublished(id: string): Promise<ArticleResponse> {
    const article = await articlesRepository.findById(id);
    if (!article) {
      throw new NotFoundError('Article not found', 'ARTICLE_NOT_FOUND');
    }

    return articlesRepository.update(id, { isPublished: !article.isPublished });
  }

  // ── Cover Image Upload ──────────────────────────────

  async uploadCoverImage(id: string, file: MultipartFile): Promise<ArticleResponse> {
    const article = await articlesRepository.findById(id);
    if (!article) {
      throw new NotFoundError('Article not found', 'ARTICLE_NOT_FOUND');
    }

    validateImageFile(file);
    const buffer = await file.toBuffer();
    validateFileSize(buffer);

    const optimized = await imageOptimizerService.optimizeArticleCover(buffer);

    if (article.coverImage) {
      await fileStorageService.deleteArticleCoverImage(id);
    }

    const { url } = await fileStorageService.saveArticleCoverImage(id, optimized);

    return articlesRepository.update(id, { coverImage: url });
  }

  // ── Content Image Upload ────────────────────────────

  async uploadContentImage(id: string, file: MultipartFile): Promise<{ url: string }> {
    const exists = await articlesRepository.existsById(id);
    if (!exists) {
      throw new NotFoundError('Article not found', 'ARTICLE_NOT_FOUND');
    }

    validateImageFile(file);
    const buffer = await file.toBuffer();
    validateFileSize(buffer);

    const optimized = await imageOptimizerService.optimizeArticleContentImage(buffer);
    const { url } = await fileStorageService.saveArticleContentImage(id, optimized);

    return { url };
  }
}

export const articlesService = new ArticlesService();
