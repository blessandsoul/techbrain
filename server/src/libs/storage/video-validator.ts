/**
 * Video Upload Validator
 *
 * Validates uploaded video files for security and compliance with upload constraints.
 */

import type { MultipartFile } from '@fastify/multipart';
import { ValidationError } from '@shared/errors/errors.js';
import { env } from '@config/env.js';
import path from 'path';

/**
 * Video upload constants and constraints
 */
export const VIDEO_UPLOAD_CONSTANTS = {
  MAX_VIDEO_FILE_SIZE: env.MAX_VIDEO_FILE_SIZE_MB * 1024 * 1024,
  ALLOWED_MIME_TYPES: ['video/mp4', 'video/webm', 'video/quicktime'] as const,
  ALLOWED_EXTENSIONS: ['.mp4', '.webm', '.mov'] as const,
} as const;

/**
 * Validates an uploaded video file
 *
 * @param file - Fastify multipart file object
 * @throws ValidationError if file is invalid
 */
export function validateVideoFile(file: MultipartFile): void {
  if (!file) {
    throw new ValidationError('No file was uploaded', 'FILE_REQUIRED');
  }

  const mimeType = file.mimetype;
  if (!(VIDEO_UPLOAD_CONSTANTS.ALLOWED_MIME_TYPES as readonly string[]).includes(mimeType)) {
    throw new ValidationError(
      `Invalid file type. Allowed types: ${VIDEO_UPLOAD_CONSTANTS.ALLOWED_MIME_TYPES.join(', ')}`,
      'INVALID_FILE_TYPE'
    );
  }

  const extension = path.extname(file.filename).toLowerCase();
  if (!(VIDEO_UPLOAD_CONSTANTS.ALLOWED_EXTENSIONS as readonly string[]).includes(extension)) {
    throw new ValidationError(
      `Invalid file extension. Allowed extensions: ${VIDEO_UPLOAD_CONSTANTS.ALLOWED_EXTENSIONS.join(', ')}`,
      'INVALID_FILE_EXTENSION'
    );
  }

  const dangerousExtensions = ['.exe', '.sh', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js'];
  const lowerFilename = file.filename.toLowerCase();
  if (dangerousExtensions.some((ext) => lowerFilename.endsWith(ext))) {
    throw new ValidationError('Executable files are not allowed', 'DANGEROUS_FILE');
  }
}

/**
 * Validates video file buffer size
 *
 * @param buffer - File buffer
 * @throws ValidationError if buffer exceeds max size
 */
export function validateVideoFileSize(buffer: Buffer): void {
  if (buffer.length === 0) {
    throw new ValidationError('Uploaded file is empty', 'FILE_EMPTY');
  }

  if (buffer.length > VIDEO_UPLOAD_CONSTANTS.MAX_VIDEO_FILE_SIZE) {
    const maxSizeMB = VIDEO_UPLOAD_CONSTANTS.MAX_VIDEO_FILE_SIZE / (1024 * 1024);
    throw new ValidationError(
      `File size exceeds maximum allowed size of ${maxSizeMB}MB`,
      'FILE_TOO_LARGE'
    );
  }
}
