import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@libs/prisma.js', () => ({
  prisma: {
    product: { aggregate: vi.fn(), count: vi.fn(), findMany: vi.fn() },
    category: { findMany: vi.fn() },
    $transaction: vi.fn(),
  },
}));

import { Prisma } from '@prisma/client';
import { prisma } from '@libs/prisma.js';

import { productsRepository } from '../products.repo.js';

const productMock = vi.mocked(prisma.product, true);

/** A database row in the shape toProductResponse expects (relations empty; only price/stock matter here). */
function row(id: string, price: number, inStock = true): never {
  return {
    id, slug: id, categories: [], specs: [], price, originalPrice: null, currency: 'GEL',
    isActive: true, isFeatured: false, inStock, images: [], videoUrl: null,
    nameKa: id, nameRu: '', nameEn: '', descriptionKa: null, descriptionRu: null, descriptionEn: null,
    content: null, relatedProducts: null, createdAt: new Date('2026-01-01T00:00:00Z'),
  } as never;
}

const hasPricedFilter = (where: unknown): boolean => JSON.stringify(where).includes('"price":{"gt":0}');

describe('ProductsRepository price handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPriceRange', () => {
    it('should ignore price-on-request (price 0) products when computing the range', async () => {
      productMock.aggregate.mockResolvedValue({ _min: { price: 5.1 }, _max: { price: 8802.1 } } as never);

      const range = await productsRepository.getPriceRange();

      expect(range).toEqual({ min: 5.1, max: 8802.1 });
      expect(productMock.aggregate).toHaveBeenCalledWith(
        expect.objectContaining({ where: { AND: [{ isActive: true }, { price: { gt: 0 } }] } }),
      );
    });

    it('should return 0/0 when no product has a real price', async () => {
      productMock.aggregate.mockResolvedValue({ _min: { price: null }, _max: { price: null } } as never);

      await expect(productsRepository.getPriceRange()).resolves.toEqual({ min: 0, max: 0 });
    });
  });

  describe('findFiltered', () => {
    const base = { locale: 'ka', filterConfigs: [] as never[] };

    it('should exclude price-0 products from the priceRange returned with the page', async () => {
      productMock.aggregate.mockResolvedValue({ _min: { price: 12 }, _max: { price: 90 } } as never);
      productMock.count.mockResolvedValue(0);
      productMock.findMany.mockResolvedValue([]);

      const result = await productsRepository.findFiltered({ ...base, sort: 'newest', page: 1, limit: 4 });

      expect(result.priceRange).toEqual({ min: 12, max: 90 });
      expect(hasPricedFilter(productMock.aggregate.mock.calls[0]?.[0])).toBe(true);
    });

    it('should keep a single query and the original ordering for sorts other than price-asc', async () => {
      productMock.aggregate.mockResolvedValue({ _min: { price: 1 }, _max: { price: 2 } } as never);
      productMock.count.mockResolvedValue(9);
      productMock.findMany.mockResolvedValue([row('a', 1)]);

      await productsRepository.findFiltered({ ...base, sort: 'newest', page: 2, limit: 4 });

      expect(productMock.count).toHaveBeenCalledTimes(1);
      expect(productMock.findMany).toHaveBeenCalledTimes(1);
      expect(productMock.findMany).toHaveBeenCalledWith(expect.objectContaining({
        orderBy: [{ inStock: 'desc' }, { createdAt: 'desc' }], skip: 4, take: 4,
      }));
    });

    describe('price-asc: price-on-request products last', () => {
      // 7 priced products (already in price order) followed by 5 price-0 products = 12 in total.
      const priced = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7'].map((id, i) => row(id, 10 + i));
      const onRequest = ['z1', 'z2', 'z3', 'z4', 'z5'].map((id) => row(id, 0));

      beforeEach(() => {
        productMock.aggregate.mockResolvedValue({ _min: { price: 10 }, _max: { price: 16 } } as never);
        productMock.count.mockImplementation((async ({ where }: { where: unknown }) =>
          hasPricedFilter(where) ? priced.length : priced.length + onRequest.length) as never);
        // Simulates the database for the two segments the repository asks for.
        productMock.findMany.mockImplementation((async ({ where, skip, take }: { where: unknown; skip: number; take: number }) =>
          (hasPricedFilter(where) ? priced : onRequest).slice(skip, skip + take)) as never);
      });

      async function pageIds(page: number, limit: number): Promise<string[]> {
        const result = await productsRepository.findFiltered({ ...base, sort: 'price-asc', page, limit });
        return result.items.map((item) => item.id);
      }

      it('should list every priced product before any price-0 product, with no gaps or repeats across pages', async () => {
        const all = [...await pageIds(1, 5), ...await pageIds(2, 5), ...await pageIds(3, 5)];

        expect(all).toEqual(['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'z1', 'z2', 'z3', 'z4', 'z5']);
      });

      it('should fill a page that straddles the priced / price-0 boundary from both segments', async () => {
        // offset 5, limit 5 -> p6, p7 from the priced segment, then z1, z2, z3 from the price-0 segment
        expect(await pageIds(2, 5)).toEqual(['p6', 'p7', 'z1', 'z2', 'z3']);
      });

      it('should serve a page that lies entirely inside the price-0 segment', async () => {
        // offset 10, limit 5 -> only z4, z5 remain; the priced segment is skipped entirely
        expect(await pageIds(3, 5)).toEqual(['z4', 'z5']);
        expect(productMock.findMany).toHaveBeenCalledTimes(1);
      });

      it('should use id as the final tie-breaker so equal prices page deterministically', async () => {
        await pageIds(1, 5);

        expect(productMock.findMany).toHaveBeenCalledWith(expect.objectContaining({
          orderBy: [{ inStock: 'desc' }, { price: 'asc' }, { id: 'asc' }],
        }));
      });
    });
  });
});

describe('ProductsRepository related products', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // relatedProducts has three states: never set (NULL/undefined) = automatic suggestions, `[]` = explicitly none,
  // ids = a curated list. The admin can move a product between all three.
  const productWith = (relatedProducts?: string[]): never =>
    ({ id: 'main', categories: ['ip-cameras'], relatedProducts }) as never;

  describe('findRelated', () => {
    it('should return the curated products, active only, when the list has ids', async () => {
      productMock.findMany.mockResolvedValue([row('a', 10), row('b', 20)]);

      const result = await productsRepository.findRelated(productWith(['a', 'b']), 3);

      expect(result.map((p) => p.id)).toEqual(['a', 'b']);
      expect(productMock.findMany).toHaveBeenCalledTimes(1);
      expect(productMock.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: { in: ['a', 'b'] }, isActive: true } }),
      );
    });

    it('should never offer a product as its own bundle partner, even if its own id is in the stored list', async () => {
      productMock.findMany.mockResolvedValue([row('a', 10)]);

      await productsRepository.findRelated(productWith(['main', 'a']), 3);

      expect(productMock.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: { in: ['a'] }, isActive: true } }),
      );
    });

    it('should return nothing, without querying, when the list was explicitly emptied', async () => {
      const result = await productsRepository.findRelated(productWith([]), 3);

      expect(result).toEqual([]);
      expect(productMock.findMany).not.toHaveBeenCalled();
    });

    it('should fall back to category-based suggestions when the list was never set', async () => {
      productMock.findMany.mockResolvedValue([row('auto-1', 5)]);

      const result = await productsRepository.findRelated(productWith(undefined), 3);

      expect(result.map((p) => p.id)).toEqual(['auto-1']);
      expect(productMock.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 3, where: expect.objectContaining({ id: { not: 'main' }, isActive: true }) }),
      );
    });
  });

  describe('update: relatedProducts', () => {
    /** Runs update() against a fake transaction and returns the data passed to product.update. */
    async function updatedData(data: { relatedProducts?: string[] | null }): Promise<Record<string, unknown>> {
      const tx = {
        productCategory: { deleteMany: vi.fn(), createMany: vi.fn() },
        productSpec: { deleteMany: vi.fn(), createMany: vi.fn() },
        product: { update: vi.fn().mockResolvedValue(row('main', 10)) },
      };
      (prisma.$transaction as unknown as ReturnType<typeof vi.fn>).mockImplementation(
        async (callback: (client: typeof tx) => unknown) => callback(tx),
      );

      await productsRepository.update('main', data);

      return tx.product.update.mock.calls[0][0].data as Record<string, unknown>;
    }

    it('should store an emptied list as [] so the product shows no bundle', async () => {
      const data = await updatedData({ relatedProducts: [] });

      expect(data.relatedProducts).toEqual([]);
    });

    it('should store null as a database NULL so the product goes back to automatic suggestions', async () => {
      const data = await updatedData({ relatedProducts: null });

      // A plain JS null is rejected by Prisma for a Json column; DbNull is the required marker.
      expect(data.relatedProducts).toBe(Prisma.DbNull);
    });

    it('should leave the stored list untouched when the field is not sent', async () => {
      const data = await updatedData({});

      expect(data).not.toHaveProperty('relatedProducts');
    });
  });
});
