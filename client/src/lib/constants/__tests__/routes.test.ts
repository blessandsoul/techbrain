import { describe, it, expect } from 'vitest';
import { ROUTES } from '../routes';

describe('ROUTES', () => {
  describe('ADMIN.TAGS', () => {
    it('should point to /admin/tags', () => {
      expect(ROUTES.ADMIN.TAGS).toBe('/admin/tags');
    });
  });

  describe('existing routes unchanged', () => {
    it('should still have ADMIN.ARTICLES', () => {
      expect(ROUTES.ADMIN.ARTICLES).toBe('/admin/articles');
    });

    it('should still have ADMIN.PROJECTS', () => {
      expect(ROUTES.ADMIN.PROJECTS).toBe('/admin/projects');
    });
  });
});
