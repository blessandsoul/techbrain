import { describe, it, expect } from 'vitest';
import { API_ENDPOINTS } from '../api-endpoints';

describe('API_ENDPOINTS', () => {
  describe('TAGS', () => {
    it('should have LIST endpoint', () => {
      expect(API_ENDPOINTS.TAGS.LIST).toBe('/tags');
    });

    it('should have CREATE endpoint', () => {
      expect(API_ENDPOINTS.TAGS.CREATE).toBe('/tags');
    });

    it('should generate UPDATE endpoint with id', () => {
      expect(API_ENDPOINTS.TAGS.UPDATE('abc-123')).toBe('/tags/abc-123');
    });

    it('should generate DELETE endpoint with id', () => {
      expect(API_ENDPOINTS.TAGS.DELETE('abc-123')).toBe('/tags/abc-123');
    });
  });

  describe('ARTICLES (tag/faq-related)', () => {
    it('should still have existing endpoints', () => {
      expect(API_ENDPOINTS.ARTICLES.LIST).toBe('/articles');
      expect(API_ENDPOINTS.ARTICLES.CREATE).toBe('/articles');
      expect(API_ENDPOINTS.ARTICLES.UPDATE('id-1')).toBe('/articles/id-1');
    });
  });

  describe('PROJECTS (tag/faq-related)', () => {
    it('should still have existing endpoints', () => {
      expect(API_ENDPOINTS.PROJECTS.ACTIVE).toBe('/projects');
      expect(API_ENDPOINTS.PROJECTS.CREATE).toBe('/projects');
      expect(API_ENDPOINTS.PROJECTS.UPDATE('id-1')).toBe('/projects/id-1');
    });
  });
});
