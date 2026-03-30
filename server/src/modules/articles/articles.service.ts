/**
 * Articles Module — Service
 *
 * Business logic for blog articles.
 */

import { NotFoundError, ConflictError } from '@shared/errors/errors.js';
import { generateUniqueSlug } from '@libs/slugify.js';
import { articlesRepository } from './articles.repo.js';
import { fileStorageService } from '@libs/storage/file-storage.service.js';
import { imageOptimizerService } from '@libs/storage/image-optimizer.service.js';
import { validateImageFile, validateFileSize } from '@libs/storage/file-validator.js';
import { validateVideoFile, validateVideoFileSize } from '@libs/storage/video-validator.js';
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
    // Auto-generate slug from title if not provided; resolve conflicts with -2, -3, etc.
    const sourceText = input.slug || input.title;
    const slug = await generateUniqueSlug(sourceText, (s) => articlesRepository.existsBySlug(s));

    return articlesRepository.create({
      slug,
      title: input.title,
      excerpt: input.excerpt,
      content: input.content,
      category: input.category,
      readMin: input.readMin ?? 5,
      isPublished: input.isPublished ?? false,
      authorId,
      tagIds: input.tagIds ?? [],
      faqs: input.faqs ?? [],
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

    // If videoUrl is being set to null, delete the video file from storage
    if (input.videoUrl === null) {
      const article = await articlesRepository.findById(id);
      if (article?.videoUrl) {
        await fileStorageService.deleteArticleVideo(article.videoUrl);
      }
    }

    return articlesRepository.update(id, {
      slug: input.slug,
      title: input.title,
      excerpt: input.excerpt,
      content: input.content,
      category: input.category,
      coverImage: input.coverImage,
      videoUrl: input.videoUrl,
      readMin: input.readMin,
      isPublished: input.isPublished,
      tagIds: input.tagIds,
      faqs: input.faqs,
    });
  }

  async deleteArticle(id: string): Promise<void> {
    const exists = await articlesRepository.existsById(id);
    if (!exists) {
      throw new NotFoundError('Article not found', 'ARTICLE_NOT_FOUND');
    }

    await fileStorageService.deleteArticleDir(id);
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

  // ── Video Upload ───────────────────────────────────

  async uploadVideo(id: string, file: MultipartFile): Promise<ArticleResponse> {
    const article = await articlesRepository.findById(id);
    if (!article) {
      throw new NotFoundError('Article not found', 'ARTICLE_NOT_FOUND');
    }

    validateVideoFile(file);
    const buffer = await file.toBuffer();
    validateVideoFileSize(buffer);

    const extension = '.' + file.filename.split('.').pop()!.toLowerCase();

    if (article.videoUrl) {
      await fileStorageService.deleteArticleVideo(article.videoUrl);
    }

    const { url } = await fileStorageService.saveArticleVideo(id, buffer, extension);

    return articlesRepository.update(id, { videoUrl: url });
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
