/**
 * File Storage Service
 *
 * Handles local file system operations for user-uploaded files.
 * Directory structure: uploads/users/{userId}/<media-type>/
 */

import fs from 'fs/promises';
import path from 'path';
import { logger } from '@libs/logger.js';
import { BadRequestError, InternalError } from '@shared/errors/errors.js';
import { generateAvatarFilename } from './filename-sanitizer.js';

/**
 * File Storage Service
 *
 * Manages local file storage with per-user directories and SEO-friendly naming.
 * All user media lives under uploads/users/{userId}/ for easy per-user cleanup.
 */
class FileStorageService {
  private readonly uploadDir: string;
  private readonly usersDir: string;
  private readonly projectsDir: string;
  private readonly articlesDir: string;
  private readonly productsDir: string;

  constructor() {
    // Base upload directory: server/uploads
    this.uploadDir = path.join(process.cwd(), 'uploads');
    // Users media directory: server/uploads/users
    this.usersDir = path.join(this.uploadDir, 'users');
    // Projects media directory: server/uploads/projects
    this.projectsDir = path.join(this.uploadDir, 'projects');
    // Articles media directory: server/uploads/articles
    this.articlesDir = path.join(this.uploadDir, 'articles');
    // Products media directory: server/uploads/products
    this.productsDir = path.join(this.uploadDir, 'products');
  }

  /**
   * Gets the base directory for a user's media
   */
  private getUserDir(userId: string): string {
    return path.join(this.usersDir, userId);
  }

  /**
   * Gets the avatar directory for a user
   */
  private getUserAvatarDir(userId: string): string {
    return path.join(this.getUserDir(userId), 'avatar');
  }

  /**
   * Saves an avatar image to user-specific directory
   *
   * Process:
   * 1. Create user avatar directory if it doesn't exist
   * 2. Generate SEO-friendly filename
   * 3. Save buffer to file (overwrites existing avatar)
   * 4. Return filename and public URL
   *
   * @param userId - User's unique ID
   * @param buffer - Optimized image buffer
   * @param firstName - User's first name (for SEO filename)
   * @param lastName - User's last name (for SEO filename)
   * @returns Filename and URL of saved avatar
   *
   * @example
   * ```typescript
   * const { filename, url } = await fileStorageService.saveAvatar(
   *   userId,
   *   imageBuffer,
   *   'John',
   *   'Doe'
   * );
   * // filename: "john-doe-avatar.webp"
   * // url: "/uploads/users/{userId}/avatar/john-doe-avatar.webp"
   * ```
   */
  async saveAvatar(
    userId: string,
    buffer: Buffer,
    firstName: string,
    lastName: string
  ): Promise<{ filename: string; url: string }> {
    try {
      // Ensure user's avatar directory exists
      const avatarDir = this.getUserAvatarDir(userId);
      await this.ensureDirectoryExists(avatarDir);

      // Generate SEO-friendly filename
      const filename = generateAvatarFilename(firstName, lastName, 'webp');
      const filePath = path.join(avatarDir, filename);

      // Write file to disk (overwrites existing)
      await fs.writeFile(filePath, buffer);

      // Generate public URL
      const url = `/uploads/users/${userId}/avatar/${filename}`;

      logger.info({
        msg: 'Avatar saved successfully',
        userId,
        filename,
        fileSize: buffer.length,
      });

      return { filename, url };
    } catch (error) {
      logger.error({ err: error, msg: 'Failed to save avatar', userId });
      throw new InternalError('Failed to save avatar file', 'FILE_SAVE_FAILED');
    }
  }

  /**
   * Deletes a user's avatar directory and all contents
   *
   * @param userId - User's unique ID
   * @throws InternalError if deletion fails
   *
   * @example
   * ```typescript
   * await fileStorageService.deleteAvatar(userId);
   * ```
   */
  async deleteAvatar(userId: string): Promise<void> {
    try {
      const avatarDir = this.getUserAvatarDir(userId);

      // Check if directory exists
      const exists = await this.directoryExists(avatarDir);
      if (!exists) {
        logger.info({ msg: 'Avatar directory does not exist, nothing to delete', userId });
        return;
      }

      // Delete avatar directory and contents
      await fs.rm(avatarDir, { recursive: true, force: true });

      logger.info({ msg: 'Avatar deleted successfully', userId });
    } catch (error) {
      logger.error({ err: error, msg: 'Failed to delete avatar', userId });
      throw new InternalError('Failed to delete avatar file', 'FILE_DELETE_FAILED');
    }
  }

  /**
   * Deletes all media for a user (entire user directory)
   *
   * Used by the cleanup job when permanently purging deleted accounts.
   * No-op if the user directory doesn't exist.
   *
   * @param userId - User's unique ID
   *
   * @example
   * ```typescript
   * await fileStorageService.deleteUserMedia(userId);
   * ```
   */
  async deleteUserMedia(userId: string): Promise<void> {
    try {
      const userDir = this.getUserDir(userId);

      const exists = await this.directoryExists(userDir);
      if (!exists) {
        return;
      }

      await fs.rm(userDir, { recursive: true, force: true });

      logger.info({ msg: 'User media deleted successfully', userId });
    } catch (error) {
      logger.error({ err: error, msg: 'Failed to delete user media', userId });
      throw new InternalError('Failed to delete user media', 'FILE_DELETE_FAILED');
    }
  }

  // ── Project Image Methods ──────────────────────────

  /**
   * Gets the image directory for a project
   */
  private getProjectImageDir(projectId: string): string {
    return path.join(this.projectsDir, projectId);
  }

  /**
   * Saves a project image to project-specific directory
   *
   * @param projectId - Project's unique ID
   * @param buffer - Optimized image buffer
   * @returns URL of saved image
   */
  async saveProjectImage(
    projectId: string,
    buffer: Buffer,
  ): Promise<{ filename: string; url: string }> {
    try {
      const imageDir = this.getProjectImageDir(projectId);
      await this.ensureDirectoryExists(imageDir);

      const filename = `project-${projectId.slice(0, 8)}.webp`;
      const filePath = path.join(imageDir, filename);

      await fs.writeFile(filePath, buffer);

      const url = `/uploads/projects/${projectId}/${filename}`;

      logger.info({
        msg: 'Project image saved successfully',
        projectId,
        filename,
        fileSize: buffer.length,
      });

      return { filename, url };
    } catch (error) {
      logger.error({ err: error, msg: 'Failed to save project image', projectId });
      throw new InternalError('Failed to save project image', 'FILE_SAVE_FAILED');
    }
  }

  /**
   * Deletes a project's image directory and all contents
   *
   * @param projectId - Project's unique ID
   */
  async deleteProjectImage(projectId: string): Promise<void> {
    try {
      const imageDir = this.getProjectImageDir(projectId);

      const exists = await this.directoryExists(imageDir);
      if (!exists) {
        return;
      }

      await fs.rm(imageDir, { recursive: true, force: true });

      logger.info({ msg: 'Project image deleted successfully', projectId });
    } catch (error) {
      logger.error({ err: error, msg: 'Failed to delete project image', projectId });
      throw new InternalError('Failed to delete project image', 'FILE_DELETE_FAILED');
    }
  }

  // ── Project Content Image Methods ────────────────

  private getProjectContentDir(projectId: string): string {
    return path.join(this.projectsDir, projectId, 'content');
  }

  async saveProjectContentImage(
    projectId: string,
    buffer: Buffer,
  ): Promise<{ filename: string; url: string }> {
    try {
      const imageDir = this.getProjectContentDir(projectId);
      await this.ensureDirectoryExists(imageDir);

      const timestamp = Date.now();
      const filename = `img-${timestamp}.webp`;
      const filePath = path.join(imageDir, filename);

      await fs.writeFile(filePath, buffer);

      const url = `/uploads/projects/${projectId}/content/${filename}`;

      logger.info({
        msg: 'Project content image saved successfully',
        projectId,
        filename,
        fileSize: buffer.length,
      });

      return { filename, url };
    } catch (error) {
      logger.error({ err: error, msg: 'Failed to save project content image', projectId });
      throw new InternalError('Failed to save project content image', 'FILE_SAVE_FAILED');
    }
  }

  // ── Product Image Methods ────────────────────────

  /**
   * Gets the image directory for a product (or 'temp' for pre-creation uploads)
   */
  private getProductImageDir(productId: string): string {
    return path.join(this.productsDir, productId);
  }

  /**
   * Saves a product image with a timestamp-based filename
   *
   * @param productId - Product ID or 'temp' for pre-creation uploads
   * @param buffer - Optimized image buffer
   * @returns Filename and public URL of saved image
   */
  async saveProductImage(
    productId: string,
    buffer: Buffer,
  ): Promise<{ filename: string; url: string }> {
    try {
      const imageDir = this.getProductImageDir(productId);
      await this.ensureDirectoryExists(imageDir);

      const timestamp = Date.now();
      const filename = `img-${timestamp}.webp`;
      const filePath = path.join(imageDir, filename);

      await fs.writeFile(filePath, buffer);

      const url = `/uploads/products/${productId}/${filename}`;

      logger.info({
        msg: 'Product image saved successfully',
        productId,
        filename,
        fileSize: buffer.length,
      });

      return { filename, url };
    } catch (error) {
      logger.error({ err: error, msg: 'Failed to save product image', productId });
      throw new InternalError('Failed to save product image', 'FILE_SAVE_FAILED');
    }
  }

  /**
   * Deletes a single product image by its public URL
   *
   * @param imageUrl - Public URL like /uploads/products/{id}/img-123.webp
   */
  async deleteProductImage(imageUrl: string): Promise<void> {
    try {
      // Convert URL to file system path: /uploads/products/... → uploads/products/...
      const relativePath = imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl;
      const filePath = path.join(process.cwd(), relativePath);
      this.assertPathWithinUploads(filePath);

      const exists = await this.fileExists(filePath);
      if (!exists) {
        logger.info({ msg: 'Product image does not exist, nothing to delete', imageUrl });
        return;
      }

      await fs.unlink(filePath);
      logger.info({ msg: 'Product image deleted successfully', imageUrl });
    } catch (error) {
      logger.error({ err: error, msg: 'Failed to delete product image', imageUrl });
      throw new InternalError('Failed to delete product image', 'FILE_DELETE_FAILED');
    }
  }

  /**
   * Deletes an entire product's image directory
   *
   * @param productId - Product's unique ID
   */
  async deleteProductImageDir(productId: string): Promise<void> {
    try {
      const imageDir = this.getProductImageDir(productId);

      const exists = await this.directoryExists(imageDir);
      if (!exists) {
        return;
      }

      await fs.rm(imageDir, { recursive: true, force: true });
      logger.info({ msg: 'Product image directory deleted successfully', productId });
    } catch (error) {
      logger.error({ err: error, msg: 'Failed to delete product image directory', productId });
      throw new InternalError('Failed to delete product image directory', 'FILE_DELETE_FAILED');
    }
  }

  // ── Product Video Methods ───────────────────────

  async saveProductVideo(
    productId: string,
    buffer: Buffer,
    extension: string,
  ): Promise<{ filename: string; url: string }> {
    try {
      const imageDir = this.getProductImageDir(productId);
      await this.ensureDirectoryExists(imageDir);

      const timestamp = Date.now();
      const filename = `video-${timestamp}${extension}`;
      const filePath = path.join(imageDir, filename);

      await fs.writeFile(filePath, buffer);

      const url = `/uploads/products/${productId}/${filename}`;

      logger.info({
        msg: 'Product video saved successfully',
        productId,
        filename,
        fileSize: buffer.length,
      });

      return { filename, url };
    } catch (error) {
      logger.error({ err: error, msg: 'Failed to save product video', productId });
      throw new InternalError('Failed to save product video', 'FILE_SAVE_FAILED');
    }
  }

  async deleteProductVideo(videoUrl: string): Promise<void> {
    try {
      const relativePath = videoUrl.startsWith('/') ? videoUrl.slice(1) : videoUrl;
      const filePath = path.join(process.cwd(), relativePath);
      this.assertPathWithinUploads(filePath);

      const exists = await this.fileExists(filePath);
      if (!exists) {
        logger.info({ msg: 'Product video does not exist, nothing to delete', videoUrl });
        return;
      }

      await fs.unlink(filePath);
      logger.info({ msg: 'Product video deleted successfully', videoUrl });
    } catch (error) {
      logger.error({ err: error, msg: 'Failed to delete product video', videoUrl });
      throw new InternalError('Failed to delete product video', 'FILE_DELETE_FAILED');
    }
  }

  // ── Project Video Methods ──────────────────────

  async saveProjectVideo(
    projectId: string,
    buffer: Buffer,
    extension: string,
  ): Promise<{ filename: string; url: string }> {
    try {
      const videoDir = this.getProjectImageDir(projectId);
      await this.ensureDirectoryExists(videoDir);

      const filename = `video-${projectId.slice(0, 8)}${extension}`;
      const filePath = path.join(videoDir, filename);

      await fs.writeFile(filePath, buffer);

      const url = `/uploads/projects/${projectId}/${filename}`;

      logger.info({
        msg: 'Project video saved successfully',
        projectId,
        filename,
        fileSize: buffer.length,
      });

      return { filename, url };
    } catch (error) {
      logger.error({ err: error, msg: 'Failed to save project video', projectId });
      throw new InternalError('Failed to save project video', 'FILE_SAVE_FAILED');
    }
  }

  async deleteProjectVideo(videoUrl: string): Promise<void> {
    try {
      const relativePath = videoUrl.startsWith('/') ? videoUrl.slice(1) : videoUrl;
      const filePath = path.join(process.cwd(), relativePath);
      this.assertPathWithinUploads(filePath);

      const exists = await this.fileExists(filePath);
      if (!exists) {
        logger.info({ msg: 'Project video does not exist, nothing to delete', videoUrl });
        return;
      }

      await fs.unlink(filePath);
      logger.info({ msg: 'Project video deleted successfully', videoUrl });
    } catch (error) {
      logger.error({ err: error, msg: 'Failed to delete project video', videoUrl });
      throw new InternalError('Failed to delete project video', 'FILE_DELETE_FAILED');
    }
  }

  // ── Article Video Methods ─────────────────────

  async saveArticleVideo(
    articleId: string,
    buffer: Buffer,
    extension: string,
  ): Promise<{ filename: string; url: string }> {
    try {
      const videoDir = this.getArticleCoverDir(articleId);
      await this.ensureDirectoryExists(videoDir);

      const filename = `video-${articleId.slice(0, 8)}${extension}`;
      const filePath = path.join(videoDir, filename);

      await fs.writeFile(filePath, buffer);

      const url = `/uploads/articles/${articleId}/${filename}`;

      logger.info({
        msg: 'Article video saved successfully',
        articleId,
        filename,
        fileSize: buffer.length,
      });

      return { filename, url };
    } catch (error) {
      logger.error({ err: error, msg: 'Failed to save article video', articleId });
      throw new InternalError('Failed to save article video', 'FILE_SAVE_FAILED');
    }
  }

  async deleteArticleVideo(videoUrl: string): Promise<void> {
    try {
      const relativePath = videoUrl.startsWith('/') ? videoUrl.slice(1) : videoUrl;
      const filePath = path.join(process.cwd(), relativePath);
      this.assertPathWithinUploads(filePath);

      const exists = await this.fileExists(filePath);
      if (!exists) {
        logger.info({ msg: 'Article video does not exist, nothing to delete', videoUrl });
        return;
      }

      await fs.unlink(filePath);
      logger.info({ msg: 'Article video deleted successfully', videoUrl });
    } catch (error) {
      logger.error({ err: error, msg: 'Failed to delete article video', videoUrl });
      throw new InternalError('Failed to delete article video', 'FILE_DELETE_FAILED');
    }
  }

  // ── Article Cover Image Methods ───────────────────

  private getArticleCoverDir(articleId: string): string {
    return path.join(this.articlesDir, articleId);
  }

  async saveArticleCoverImage(
    articleId: string,
    buffer: Buffer,
  ): Promise<{ filename: string; url: string }> {
    try {
      const imageDir = this.getArticleCoverDir(articleId);
      await this.ensureDirectoryExists(imageDir);

      const filename = `article-${articleId.slice(0, 8)}.webp`;
      const filePath = path.join(imageDir, filename);

      await fs.writeFile(filePath, buffer);

      const url = `/uploads/articles/${articleId}/${filename}`;

      logger.info({
        msg: 'Article cover image saved successfully',
        articleId,
        filename,
        fileSize: buffer.length,
      });

      return { filename, url };
    } catch (error) {
      logger.error({ err: error, msg: 'Failed to save article cover image', articleId });
      throw new InternalError('Failed to save article cover image', 'FILE_SAVE_FAILED');
    }
  }

  // ── Article Content Image Methods ─────────────────

  private getArticleContentDir(articleId: string): string {
    return path.join(this.articlesDir, articleId, 'content');
  }

  async saveArticleContentImage(
    articleId: string,
    buffer: Buffer,
  ): Promise<{ filename: string; url: string }> {
    try {
      const imageDir = this.getArticleContentDir(articleId);
      await this.ensureDirectoryExists(imageDir);

      const timestamp = Date.now();
      const filename = `img-${timestamp}.webp`;
      const filePath = path.join(imageDir, filename);

      await fs.writeFile(filePath, buffer);

      const url = `/uploads/articles/${articleId}/content/${filename}`;

      logger.info({
        msg: 'Article content image saved successfully',
        articleId,
        filename,
        fileSize: buffer.length,
      });

      return { filename, url };
    } catch (error) {
      logger.error({ err: error, msg: 'Failed to save article content image', articleId });
      throw new InternalError('Failed to save article content image', 'FILE_SAVE_FAILED');
    }
  }

  async deleteArticleCoverImage(articleId: string): Promise<void> {
    try {
      const imageDir = this.getArticleCoverDir(articleId);

      const exists = await this.directoryExists(imageDir);
      if (!exists) {
        return;
      }

      await fs.rm(imageDir, { recursive: true, force: true });

      logger.info({ msg: 'Article cover image deleted successfully', articleId });
    } catch (error) {
      logger.error({ err: error, msg: 'Failed to delete article cover image', articleId });
      throw new InternalError('Failed to delete article cover image', 'FILE_DELETE_FAILED');
    }
  }

  /**
   * Gets the full file system path for an avatar
   *
   * @param userId - User's unique ID
   * @param filename - Avatar filename
   * @returns Absolute file path
   */
  getAvatarPath(userId: string, filename: string): string {
    return path.join(this.getUserAvatarDir(userId), filename);
  }

  /**
   * Gets the public URL for an avatar
   *
   * @param userId - User's unique ID
   * @param filename - Avatar filename
   * @returns Public URL path
   */
  getAvatarUrl(userId: string, filename: string): string {
    return `/uploads/users/${userId}/avatar/${filename}`;
  }

  /**
   * Validates that a resolved file path stays within the uploads directory.
   * Prevents path traversal attacks via `..` segments in user-supplied URLs.
   */
  private assertPathWithinUploads(filePath: string): void {
    const resolved = path.resolve(filePath);
    if (!resolved.startsWith(this.uploadDir + path.sep) && resolved !== this.uploadDir) {
      throw new BadRequestError('Invalid file path', 'PATH_TRAVERSAL');
    }
  }

  /**
   * Checks if a file exists
   *
   * @param filePath - Full file path
   * @returns True if file exists
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Ensures a directory exists, creates it if not
   *
   * @param dirPath - Directory path
   * @private
   */
  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      // Directory doesn't exist, create it
      await fs.mkdir(dirPath, { recursive: true });
      logger.info({ msg: 'Created directory', dirPath });
    }
  }

  /**
   * Checks if a directory exists
   *
   * @param dirPath - Directory path
   * @returns True if directory exists
   * @private
   */
  private async directoryExists(dirPath: string): Promise<boolean> {
    try {
      const stats = await fs.stat(dirPath);
      return stats.isDirectory();
    } catch {
      return false;
    }
  }

  /**
   * Initializes the upload directory structure
   *
   * Creates base uploads directory and users subdirectory if they don't exist.
   * Should be called at application startup.
   */
  async initialize(): Promise<void> {
    try {
      await this.ensureDirectoryExists(this.uploadDir);
      await this.ensureDirectoryExists(this.usersDir);
      await this.ensureDirectoryExists(this.projectsDir);
      await this.ensureDirectoryExists(this.articlesDir);
      await this.ensureDirectoryExists(this.productsDir);
      logger.info({ msg: 'File storage initialized', uploadDir: this.uploadDir });
    } catch (error) {
      logger.error({ err: error, msg: 'Failed to initialize file storage' });
      throw new InternalError('Failed to initialize file storage', 'STORAGE_INIT_FAILED');
    }
  }
}

// Export singleton instance
export const fileStorageService = new FileStorageService();
