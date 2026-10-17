import { describe, it, expect } from 'vitest';

import { buildRelatedProductsPayload } from '../related-products';

describe('buildRelatedProductsPayload', () => {
  describe('untouched draft', () => {
    // The form may be stale: another admin session can change the list after this form loaded. Re-sending the
    // loaded list on an unrelated save (price, name...) would silently undo that change.
    it('should not send the list when the admin never touched the picker, even if it holds ids', () => {
      expect(buildRelatedProductsPayload({ ids: ['a', 'b'], auto: false, touched: false }, ['a', 'b'])).toBeUndefined();
    });

    it('should not send the list for a product whose list was emptied on purpose', () => {
      expect(buildRelatedProductsPayload({ ids: [], auto: false, touched: false }, [])).toBeUndefined();
    });

    it('should not send anything for an automatic product that was left alone', () => {
      expect(buildRelatedProductsPayload({ ids: [], auto: true, touched: false }, undefined)).toBeUndefined();
    });
  });

  describe('automatic draft', () => {
    it('should send nothing for a product that was already automatic', () => {
      expect(buildRelatedProductsPayload({ ids: [], auto: true, touched: true }, undefined)).toBeUndefined();
    });

    it('should send null to return a curated product to automatic suggestions', () => {
      expect(buildRelatedProductsPayload({ ids: [], auto: true, touched: true }, ['a', 'b'])).toBeNull();
    });

    it('should send null to return a "none" product to automatic suggestions', () => {
      expect(buildRelatedProductsPayload({ ids: [], auto: true, touched: true }, [])).toBeNull();
    });
  });

  describe('manual draft', () => {
    it('should send the curated ids', () => {
      expect(buildRelatedProductsPayload({ ids: ['a', 'b'], auto: false, touched: true }, undefined)).toEqual(['a', 'b']);
    });

    it('should send [] (not undefined) when the admin removed the last product, so the removal is saved', () => {
      expect(buildRelatedProductsPayload({ ids: [], auto: false, touched: true }, ['a'])).toEqual([]);
    });

    it('should send [] when a new product is saved with an emptied list ("no bundle")', () => {
      expect(buildRelatedProductsPayload({ ids: [], auto: false, touched: true }, undefined)).toEqual([]);
    });
  });
});
