/**
 * Products Module — Repository
 *
 * Prisma queries for products, categories, specs, and catalog config.
 */

import { prisma } from '@libs/prisma.js';
import type { Prisma } from '@prisma/client';
import type {
  ProductResponse,
  SpecValueOption,
  CatalogConfigResponse,
  CatalogFilterConfig,
  CatalogCategoryConfig,
  SortOption,
} from './products.types.js';

// ── Prisma include for full product with relations ──────

const productInclude = {
  specs: true,
  categories: {
    include: { category: true },
  },
} satisfies Prisma.ProductInclude;

type ProductWithRelations = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

// ── DB → Response Mapper ────────────────────────────────

function toProductResponse(p: ProductWithRelations): ProductResponse {
  return {
    id: p.id,
    slug: p.slug,
    categories: p.categories.map((pc) => pc.category.slug),
    price: p.price,
    originalPrice: p.originalPrice ?? undefined,
    discount: p.originalPrice && p.originalPrice > p.price
      ? Math.round((1 - p.price / p.originalPrice) * 100)
      : null,
    currency: p.currency,
    isActive: p.isActive,
    isFeatured: p.isFeatured,
    images: p.images as string[],
    name: { ka: p.nameKa, ru: p.nameRu, en: p.nameEn },
    description: {
      ka: p.descriptionKa ?? p.nameKa,
      ru: p.descriptionRu ?? p.nameRu,
      en: p.descriptionEn ?? p.nameEn,
    },
    specs: p.specs.map((s) => ({
      key: { ka: s.keyKa, ru: s.keyRu, en: s.keyEn },
      value: s.value,
    })),
    relatedProducts: (p.relatedProducts as string[] | null) ?? undefined,
    createdAt: p.createdAt.toISOString(),
  };
}

// ── Related Categories Map ──────────────────────────────

const RELATED_CATEGORIES: Record<string, string[]> = {
  cameras: ['accessories', 'storage'],
  'nvr-kits': ['accessories', 'storage'],
  storage: ['accessories', 'cameras'],
  accessories: ['cameras', 'storage'],
  services: [],
};

// ── Repository ──────────────────────────────────────────

class ProductsRepository {
  // ── Single Product Queries ──────────────────────────

  async findById(id: string): Promise<ProductResponse | null> {
    const row = await prisma.product.findUnique({
      where: { id },
      include: productInclude,
    });
    return row ? toProductResponse(row) : null;
  }

  async findBySlug(slug: string): Promise<ProductResponse | null> {
    const row = await prisma.product.findUnique({
      where: { slug },
      include: productInclude,
    });
    return row ? toProductResponse(row) : null;
  }

  async findBySlugOrId(slugOrId: string): Promise<ProductResponse | null> {
    const bySlug = await this.findBySlug(slugOrId);
    if (bySlug) return bySlug;
    return this.findById(slugOrId);
  }

  // ── Featured Products ─────────────────────────────

  async findFeatured(limit: number): Promise<ProductResponse[]> {
    const rows = await prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      include: productInclude,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return rows.map(toProductResponse);
  }

  // ── Filtered Products (Catalog) ───────────────────

  async findFiltered(params: {
    categorySlug?: string;
    subcategorySpecFilter?: { kaKey: string; value: string };
    specs?: Record<string, string[]>;
    filterConfigs?: CatalogFilterConfig[];
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    hasDiscount?: boolean;
    sort: SortOption;
    page: number;
    limit: number;
    locale: string;
  }): Promise<{ items: ProductResponse[]; totalItems: number; priceRange: { min: number; max: number } }> {
    const andConditions: Prisma.ProductWhereInput[] = [];

    // Category filter via join table
    if (params.categorySlug) {
      andConditions.push({
        categories: { some: { category: { slug: params.categorySlug } } },
      });
    }

    // Subcategory spec filter
    if (params.subcategorySpecFilter) {
      const { kaKey, value } = params.subcategorySpecFilter;
      andConditions.push({ specs: { some: { keyKa: kaKey, value } } });
    }

    // Dynamic spec filters
    if (params.specs && params.filterConfigs) {
      for (const config of params.filterConfigs) {
        const selectedValues = params.specs[config.id];
        if (selectedValues && selectedValues.length > 0) {
          andConditions.push({
            specs: { some: { keyKa: config.specKaKey, value: { in: selectedValues } } },
          });
        }
      }
    }

    // Search
    if (params.search) {
      const term = params.search.trim();
      andConditions.push({
        OR: [
          { nameKa: { contains: term } },
          { nameRu: { contains: term } },
          { nameEn: { contains: term } },
          { slug: { contains: term } },
        ],
      });
    }

    // Discount filter (pre-filter: originalPrice must exist)
    if (params.hasDiscount) {
      andConditions.push({ originalPrice: { not: null } });
    }

    const baseWhere: Prisma.ProductWhereInput = {
      isActive: true,
      ...(andConditions.length > 0 ? { AND: andConditions } : {}),
    };

    // Get price range BEFORE applying price filter
    const priceAgg = await prisma.product.aggregate({
      where: baseWhere,
      _min: { price: true },
      _max: { price: true },
    });
    const priceRange = {
      min: priceAgg._min.price ?? 0,
      max: priceAgg._max.price ?? 0,
    };

    // Apply price filter
    const where: Prisma.ProductWhereInput = {
      ...baseWhere,
      ...(params.minPrice !== undefined || params.maxPrice !== undefined
        ? {
            price: {
              ...(params.minPrice !== undefined ? { gte: params.minPrice } : {}),
              ...(params.maxPrice !== undefined ? { lte: params.maxPrice } : {}),
            },
          }
        : {}),
    };

    // When hasDiscount is true, we need to post-filter (originalPrice > price)
    // because Prisma can't do cross-column comparisons
    if (params.hasDiscount) {
      const allRows = await prisma.product.findMany({
        where,
        include: productInclude,
        orderBy: this.buildOrderBy(params.sort, params.locale),
      });
      const allItems = allRows
        .map(toProductResponse)
        .filter((p) => p.discount !== null && p.discount > 0);
      const totalItems = allItems.length;
      const totalPages = Math.max(1, Math.ceil(totalItems / params.limit));
      const page = Math.min(params.page, totalPages);
      const offset = (page - 1) * params.limit;

      return {
        items: allItems.slice(offset, offset + params.limit),
        totalItems,
        priceRange,
      };
    }

    const totalItems = await prisma.product.count({ where });
    const totalPages = Math.max(1, Math.ceil(totalItems / params.limit));
    const page = Math.min(params.page, totalPages);
    const offset = (page - 1) * params.limit;

    const rows = await prisma.product.findMany({
      where,
      include: productInclude,
      orderBy: this.buildOrderBy(params.sort, params.locale),
      skip: offset,
      take: params.limit,
    });

    return {
      items: rows.map(toProductResponse),
      totalItems,
      priceRange,
    };
  }

  // ── Spec Values for Filters ───────────────────────

  async getSpecValues(
    categorySlug?: string,
    subcategorySpecFilter?: { kaKey: string; value: string },
    filterConfigs: CatalogFilterConfig[] = [],
  ): Promise<Record<string, SpecValueOption[]>> {
    if (filterConfigs.length === 0) return {};

    // Build base where to get matching product IDs
    const andConditions: Prisma.ProductWhereInput[] = [];
    if (categorySlug) {
      andConditions.push({
        categories: { some: { category: { slug: categorySlug } } },
      });
    }
    if (subcategorySpecFilter) {
      andConditions.push({
        specs: { some: { keyKa: subcategorySpecFilter.kaKey, value: subcategorySpecFilter.value } },
      });
    }

    const baseWhere: Prisma.ProductWhereInput = {
      isActive: true,
      ...(andConditions.length > 0 ? { AND: andConditions } : {}),
    };

    const matchingProducts = await prisma.product.findMany({
      where: baseWhere,
      select: { id: true },
    });
    const productIds = matchingProducts.map((p) => p.id);

    if (productIds.length === 0) {
      return Object.fromEntries(filterConfigs.map((c) => [c.id, []]));
    }

    const entries = await Promise.all(
      filterConfigs.map(async (config): Promise<[string, SpecValueOption[]]> => {
        const groups = await prisma.productSpec.groupBy({
          by: ['value'],
          where: {
            keyKa: config.specKaKey,
            value: { not: '' },
            productId: { in: productIds },
          },
          _count: { _all: true },
          orderBy: { value: 'asc' },
        });
        return [config.id, groups.map((g) => ({ value: g.value, count: g._count._all }))];
      }),
    );

    return Object.fromEntries(entries);
  }

  // ── Price Range ───────────────────────────────────

  async getPriceRange(
    categorySlug?: string,
    subcategorySpecFilter?: { kaKey: string; value: string },
  ): Promise<{ min: number; max: number }> {
    const andConditions: Prisma.ProductWhereInput[] = [];
    if (categorySlug) {
      andConditions.push({
        categories: { some: { category: { slug: categorySlug } } },
      });
    }
    if (subcategorySpecFilter) {
      andConditions.push({
        specs: { some: { keyKa: subcategorySpecFilter.kaKey, value: subcategorySpecFilter.value } },
      });
    }

    const where: Prisma.ProductWhereInput = {
      isActive: true,
      ...(andConditions.length > 0 ? { AND: andConditions } : {}),
    };

    const agg = await prisma.product.aggregate({
      where,
      _min: { price: true },
      _max: { price: true },
    });
    return { min: agg._min.price ?? 0, max: agg._max.price ?? 0 };
  }

  // ── Category Counts ───────────────────────────────

  async getCategoryCounts(
    catalogConfig: CatalogConfigResponse,
  ): Promise<Record<string, number>> {
    // Total active products
    const totalCount = await prisma.product.count({ where: { isActive: true } });
    const counts: Record<string, number> = { all: totalCount };

    // Count per top-level category via join table
    const allCategories = await prisma.category.findMany({
      where: { isActive: true },
      select: { slug: true, id: true },
    });

    const categoryCounts = await Promise.all(
      allCategories.map(async (cat) => {
        const count = await prisma.product.count({
          where: {
            isActive: true,
            categories: { some: { categoryId: cat.id } },
          },
        });
        return { slug: cat.slug, count };
      }),
    );

    for (const { slug, count } of categoryCounts) {
      counts[slug] = count;
    }

    // Count subcategories (virtual, spec-filter based)
    const subcategoryQueries: Array<{ id: string; promise: Promise<number> }> = [];
    for (const cat of catalogConfig.categories) {
      if (cat.children) {
        for (const child of cat.children) {
          if (child.specFilter && cat.parentCategory) {
            const parentCat = allCategories.find((c) => c.slug === cat.parentCategory);
            if (parentCat) {
              subcategoryQueries.push({
                id: child.id,
                promise: prisma.product.count({
                  where: {
                    isActive: true,
                    categories: { some: { categoryId: parentCat.id } },
                    specs: { some: { keyKa: child.specFilter.kaKey, value: child.specFilter.value } },
                  },
                }),
              });
            }
          }
        }
      }
    }

    if (subcategoryQueries.length > 0) {
      const results = await Promise.all(subcategoryQueries.map((q) => q.promise));
      subcategoryQueries.forEach((q, i) => {
        counts[q.id] = results[i];
      });
    }

    return counts;
  }

  // ── Related Products ──────────────────────────────

  async findRelated(product: ProductResponse, limit: number): Promise<ProductResponse[]> {
    // If explicit related products set, use those
    if (product.relatedProducts && product.relatedProducts.length > 0) {
      const rows = await prisma.product.findMany({
        where: { id: { in: product.relatedProducts }, isActive: true },
        include: productInclude,
      });
      return rows.map(toProductResponse);
    }

    // Fallback: find products from related categories
    const primaryCategory = product.categories[0];
    if (!primaryCategory) return [];
    const relatedCats = RELATED_CATEGORIES[primaryCategory] ?? [];
    if (relatedCats.length === 0) return [];

    const rows = await prisma.product.findMany({
      where: {
        isActive: true,
        id: { not: product.id },
        categories: {
          some: { category: { slug: { in: relatedCats } } },
        },
      },
      include: productInclude,
      orderBy: [{ isFeatured: 'desc' }, { price: 'asc' }],
      take: limit,
    });

    return rows.map(toProductResponse);
  }

  // ── Admin: All Products (Paginated) ──────────────

  async findAllPaginated(
    page: number,
    limit: number,
    filters?: { isActive?: boolean; category?: string; search?: string },
  ): Promise<{ items: ProductResponse[]; totalItems: number }> {
    const where: Prisma.ProductWhereInput = {};

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters?.category) {
      where.categories = { some: { category: { slug: filters.category } } };
    }

    if (filters?.search) {
      const term = filters.search.trim();
      where.OR = [
        { nameKa: { contains: term } },
        { nameRu: { contains: term } },
        { nameEn: { contains: term } },
        { slug: { contains: term } },
      ];
    }

    const [rows, totalItems] = await Promise.all([
      prisma.product.findMany({
        where,
        include: productInclude,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      items: rows.map(toProductResponse),
      totalItems,
    };
  }

  // ── Admin: Batch Operations ─────────────────────

  async batchToggleActive(ids: string[], isActive: boolean): Promise<number> {
    const result = await prisma.product.updateMany({
      where: { id: { in: ids } },
      data: { isActive },
    });
    return result.count;
  }

  async batchDelete(ids: string[]): Promise<number> {
    // Delete related records first (specs, categories), then products
    await prisma.$transaction([
      prisma.productSpec.deleteMany({ where: { productId: { in: ids } } }),
      prisma.productCategory.deleteMany({ where: { productId: { in: ids } } }),
      prisma.product.deleteMany({ where: { id: { in: ids } } }),
    ]);
    return ids.length;
  }

  // ── CRUD ──────────────────────────────────────────

  async create(data: {
    slug: string;
    categoryIds: string[];
    price: number;
    originalPrice?: number;
    currency: string;
    isActive: boolean;
    isFeatured: boolean;
    images: string[];
    nameKa: string;
    nameRu: string;
    nameEn: string;
    descriptionKa?: string;
    descriptionRu?: string;
    descriptionEn?: string;
    content?: string;
    relatedProducts?: string[];
    specs: Array<{ keyKa: string; keyRu: string; keyEn: string; value: string }>;
  }): Promise<ProductResponse> {
    const row = await prisma.product.create({
      data: {
        slug: data.slug,
        price: data.price,
        originalPrice: data.originalPrice ?? null,
        currency: data.currency,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        images: data.images,
        nameKa: data.nameKa,
        nameRu: data.nameRu,
        nameEn: data.nameEn,
        descriptionKa: data.descriptionKa ?? null,
        descriptionRu: data.descriptionRu ?? null,
        descriptionEn: data.descriptionEn ?? null,
        content: data.content ?? null,
        relatedProducts: data.relatedProducts ?? undefined,
        categories: {
          create: data.categoryIds.map((categoryId) => ({ categoryId })),
        },
        specs: {
          create: data.specs,
        },
      },
      include: productInclude,
    });
    return toProductResponse(row);
  }

  async update(id: string, data: {
    slug?: string;
    categoryIds?: string[];
    price?: number;
    originalPrice?: number | null;
    currency?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    images?: string[];
    nameKa?: string;
    nameRu?: string;
    nameEn?: string;
    descriptionKa?: string | null;
    descriptionRu?: string | null;
    descriptionEn?: string | null;
    content?: string | null;
    relatedProducts?: string[] | null;
    specs?: Array<{ keyKa: string; keyRu: string; keyEn: string; value: string }>;
  }): Promise<ProductResponse> {
    const row = await prisma.$transaction(async (tx) => {
      // Update category links if provided
      if (data.categoryIds) {
        await tx.productCategory.deleteMany({ where: { productId: id } });
        await tx.productCategory.createMany({
          data: data.categoryIds.map((categoryId) => ({ productId: id, categoryId })),
        });
      }

      // Update specs if provided
      if (data.specs) {
        await tx.productSpec.deleteMany({ where: { productId: id } });
        await tx.productSpec.createMany({
          data: data.specs.map((s) => ({ productId: id, ...s })),
        });
      }

      // Build update data (exclude categoryIds and specs)
      const { categoryIds: _c, specs: _s, ...updateFields } = data;
      const updateData: Record<string, unknown> = {};
      if (updateFields.slug !== undefined) updateData.slug = updateFields.slug;
      if (updateFields.price !== undefined) updateData.price = updateFields.price;
      if (updateFields.originalPrice !== undefined) updateData.originalPrice = updateFields.originalPrice;
      if (updateFields.currency !== undefined) updateData.currency = updateFields.currency;
      if (updateFields.isActive !== undefined) updateData.isActive = updateFields.isActive;
      if (updateFields.isFeatured !== undefined) updateData.isFeatured = updateFields.isFeatured;
      if (updateFields.images !== undefined) updateData.images = updateFields.images;
      if (updateFields.nameKa !== undefined) updateData.nameKa = updateFields.nameKa;
      if (updateFields.nameRu !== undefined) updateData.nameRu = updateFields.nameRu;
      if (updateFields.nameEn !== undefined) updateData.nameEn = updateFields.nameEn;
      if (updateFields.descriptionKa !== undefined) updateData.descriptionKa = updateFields.descriptionKa;
      if (updateFields.descriptionRu !== undefined) updateData.descriptionRu = updateFields.descriptionRu;
      if (updateFields.descriptionEn !== undefined) updateData.descriptionEn = updateFields.descriptionEn;
      if (updateFields.content !== undefined) updateData.content = updateFields.content;
      if (updateFields.relatedProducts !== undefined) updateData.relatedProducts = updateFields.relatedProducts;

      return tx.product.update({
        where: { id },
        data: updateData,
        include: productInclude,
      });
    });

    return toProductResponse(row);
  }

  async delete(id: string): Promise<void> {
    await prisma.product.delete({ where: { id } });
  }

  async existsBySlug(slug: string): Promise<boolean> {
    const count = await prisma.product.count({ where: { slug } });
    return count > 0;
  }

  async existsById(id: string): Promise<boolean> {
    const count = await prisma.product.count({ where: { id } });
    return count > 0;
  }

  // ── Categories ───────────────────────────────────

  async findAllCategories(): Promise<Array<{ id: string; slug: string; name: { ka: string; ru: string; en: string } }>> {
    const rows = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    return rows.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: { ka: c.nameKa, ru: c.nameRu, en: c.nameEn },
    }));
  }

  // ── Spec Suggestions (Admin) ─────────────────────

  async getSpecSuggestions(): Promise<Array<{ key: { ka: string; ru: string; en: string }; values: string[] }>> {
    // Single query: get all non-empty specs grouped by key+value with counts
    const allGroups = await prisma.productSpec.groupBy({
      by: ['keyKa', 'keyRu', 'keyEn', 'value'],
      where: { value: { not: '' } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    // Aggregate in memory: group values under their keys
    const keyMap = new Map<string, { key: { ka: string; ru: string; en: string }; values: string[] }>();

    for (const group of allGroups) {
      const mapKey = `${group.keyKa}|${group.keyRu}|${group.keyEn}`;
      if (!keyMap.has(mapKey)) {
        keyMap.set(mapKey, {
          key: { ka: group.keyKa, ru: group.keyRu, en: group.keyEn },
          values: [],
        });
      }
      keyMap.get(mapKey)!.values.push(group.value);
    }

    return Array.from(keyMap.values());
  }

  // ── Catalog Config ────────────────────────────────

  async getCatalogConfig(): Promise<CatalogConfigResponse> {
    const row = await prisma.catalogConfig.findUnique({ where: { id: 'singleton' } });
    if (!row) return { categories: [], filters: {} };
    return {
      categories: row.categories as unknown as CatalogCategoryConfig[],
      filters: row.filters as unknown as Record<string, CatalogFilterConfig[]>,
    };
  }

  async upsertCatalogConfig(categories: unknown, filters: unknown): Promise<CatalogConfigResponse> {
    const row = await prisma.catalogConfig.upsert({
      where: { id: 'singleton' },
      create: {
        categories: JSON.parse(JSON.stringify(categories)),
        filters: JSON.parse(JSON.stringify(filters)),
      },
      update: {
        categories: JSON.parse(JSON.stringify(categories)),
        filters: JSON.parse(JSON.stringify(filters)),
      },
    });
    return {
      categories: row.categories as unknown as CatalogCategoryConfig[],
      filters: row.filters as unknown as Record<string, CatalogFilterConfig[]>,
    };
  }

  // ── Private Helpers ───────────────────────────────

  private buildOrderBy(sort: SortOption, locale: string): Prisma.ProductOrderByWithRelationInput {
    switch (sort) {
      case 'price-asc':
        return { price: 'asc' };
      case 'price-desc':
        return { price: 'desc' };
      case 'name-asc': {
        const field = locale === 'ru' ? 'nameRu' : locale === 'en' ? 'nameEn' : 'nameKa';
        return { [field]: 'asc' };
      }
      case 'newest':
      default:
        return { createdAt: 'desc' };
    }
  }
}

export const productsRepository = new ProductsRepository();
