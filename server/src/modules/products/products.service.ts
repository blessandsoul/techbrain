/**
 * Products Module — Service
 *
 * Business logic for products, catalog filtering, and catalog config.
 */

import { NotFoundError, ConflictError } from '@shared/errors/errors.js';
import { generateUniqueSlug } from '@libs/slugify.js';
import { imageOptimizerService } from '@libs/storage/image-optimizer.service.js';
import { fileStorageService } from '@libs/storage/file-storage.service.js';
import { logger } from '@libs/logger.js';
import { productsRepository } from './products.repo.js';
import type {
  ProductResponse,
  FilteredProductsResult,
  SpecValueOption,
  SpecSuggestion,
  CatalogConfigResponse,
  CatalogFiltersInput,
  CreateProductInput,
  UpdateProductInput,
} from './products.types.js';

class ProductsService {
  // ── Public Read ───────────────────────────────────

  async getProductBySlugOrId(slugOrId: string): Promise<ProductResponse> {
    const product = await productsRepository.findBySlugOrId(slugOrId);
    if (!product || !product.isActive) {
      throw new NotFoundError('Product not found', 'PRODUCT_NOT_FOUND');
    }
    return product;
  }

  async getFeaturedProducts(limit: number = 6): Promise<ProductResponse[]> {
    return productsRepository.findFeatured(limit);
  }

  async getFilteredProducts(input: CatalogFiltersInput): Promise<FilteredProductsResult> {
    // Load filter configs from catalog config
    const catalogConfig = await productsRepository.getCatalogConfig();
    const filterConfigs = input.category
      ? catalogConfig.filters[input.category] ?? []
      : [];

    return productsRepository.findFiltered({
      categorySlug: input.category,
      subcategorySpecFilter: input.subcategorySpecFilter,
      specs: input.specs,
      filterConfigs,
      search: input.search,
      minPrice: input.minPrice,
      maxPrice: input.maxPrice,
      hasDiscount: input.hasDiscount,
      sort: input.sort ?? 'newest',
      page: input.page,
      limit: input.limit,
      locale: input.locale ?? 'ka',
    });
  }

  async getSpecValues(
    category?: string,
    subcategorySpecFilter?: { kaKey: string; value: string },
  ): Promise<Record<string, SpecValueOption[]>> {
    const catalogConfig = await productsRepository.getCatalogConfig();
    const filterConfigs = category
      ? catalogConfig.filters[category] ?? []
      : [];

    return productsRepository.getSpecValues(category, subcategorySpecFilter, filterConfigs);
  }

  async getPriceRange(
    category?: string,
    subcategorySpecFilter?: { kaKey: string; value: string },
  ): Promise<{ min: number; max: number }> {
    return productsRepository.getPriceRange(category, subcategorySpecFilter);
  }

  async getCategoryCounts(): Promise<Record<string, number>> {
    const catalogConfig = await productsRepository.getCatalogConfig();
    return productsRepository.getCategoryCounts(catalogConfig);
  }

  async getRelatedProducts(slugOrId: string): Promise<ProductResponse[]> {
    const product = await productsRepository.findBySlugOrId(slugOrId);
    if (!product) {
      throw new NotFoundError('Product not found', 'PRODUCT_NOT_FOUND');
    }
    return productsRepository.findRelated(product, 3);
  }

  async getCatalogConfig(): Promise<CatalogConfigResponse> {
    return productsRepository.getCatalogConfig();
  }

  // ── Admin Categories ────────────────────────────

  async getCategories(): Promise<Array<{ id: string; slug: string; name: { ka: string; ru: string; en: string } }>> {
    return productsRepository.findAllCategories();
  }

  // ── Admin Spec Suggestions ─────────────────────

  async getSpecSuggestions(): Promise<SpecSuggestion[]> {
    return productsRepository.getSpecSuggestions();
  }

  // ── Admin Read ───────────────────────────────────

  async getAllProducts(
    page: number,
    limit: number,
    filters?: { isActive?: boolean; category?: string; search?: string },
  ): Promise<{ items: ProductResponse[]; totalItems: number }> {
    return productsRepository.findAllPaginated(page, limit, filters);
  }

  async toggleProductActive(id: string): Promise<ProductResponse> {
    const product = await productsRepository.findById(id);
    if (!product) {
      throw new NotFoundError('Product not found', 'PRODUCT_NOT_FOUND');
    }
    return productsRepository.update(id, { isActive: !product.isActive });
  }

  async batchToggleActive(ids: string[], isActive: boolean): Promise<number> {
    return productsRepository.batchToggleActive(ids, isActive);
  }

  async batchDeleteProducts(ids: string[]): Promise<number> {
    // Clean up images for each product before batch delete
    for (const id of ids) {
      const product = await productsRepository.findById(id);
      if (product) {
        await this.cleanupProductImages(product.images);
      }
    }
    return productsRepository.batchDelete(ids);
  }

  // ── Admin CRUD ────────────────────────────────────

  async createProduct(input: CreateProductInput): Promise<ProductResponse> {
    // Auto-generate slug from name if not provided; resolve conflicts with -2, -3, etc.
    const sourceText = input.slug || input.name.en || input.name.ka;
    const slug = await generateUniqueSlug(sourceText, (s) => productsRepository.existsBySlug(s));

    return productsRepository.create({
      slug,
      categoryIds: input.categoryIds,
      price: input.price,
      originalPrice: input.originalPrice,
      currency: input.currency ?? 'GEL',
      isActive: input.isActive ?? true,
      isFeatured: input.isFeatured ?? false,
      images: input.images ?? [],
      nameKa: input.name.ka,
      nameRu: input.name.ru ?? '',
      nameEn: input.name.en ?? '',
      descriptionKa: input.description?.ka,
      descriptionRu: input.description?.ru,
      descriptionEn: input.description?.en,
      content: input.content,
      relatedProducts: input.relatedProducts,
      specs: (input.specs ?? []).map((s) => ({
        keyKa: s.key.ka,
        keyRu: s.key.ru ?? '',
        keyEn: s.key.en ?? '',
        value: s.value,
      })),
    });
  }

  async updateProduct(id: string, input: UpdateProductInput): Promise<ProductResponse> {
    const exists = await productsRepository.existsById(id);
    if (!exists) {
      throw new NotFoundError('Product not found', 'PRODUCT_NOT_FOUND');
    }

    // Check slug uniqueness if slug is being changed
    if (input.slug) {
      const existing = await productsRepository.findBySlug(input.slug);
      if (existing && existing.id !== id) {
        throw new ConflictError('Product with this slug already exists', 'PRODUCT_SLUG_EXISTS');
      }
    }

    return productsRepository.update(id, {
      slug: input.slug,
      categoryIds: input.categoryIds,
      price: input.price,
      originalPrice: input.originalPrice,
      currency: input.currency,
      isActive: input.isActive,
      isFeatured: input.isFeatured,
      images: input.images,
      nameKa: input.name?.ka,
      nameRu: input.name?.ru,
      nameEn: input.name?.en,
      descriptionKa: input.description?.ka,
      descriptionRu: input.description?.ru,
      descriptionEn: input.description?.en,
      content: input.content,
      relatedProducts: input.relatedProducts,
      specs: input.specs?.map((s) => ({
        keyKa: s.key.ka,
        keyRu: s.key.ru ?? '',
        keyEn: s.key.en ?? '',
        value: s.value,
      })),
    });
  }

  async deleteProduct(id: string): Promise<void> {
    const product = await productsRepository.findById(id);
    if (!product) {
      throw new NotFoundError('Product not found', 'PRODUCT_NOT_FOUND');
    }

    // Clean up image files from disk
    await this.cleanupProductImages(product.images);

    await productsRepository.delete(id);
  }

  async updateCatalogConfig(categories: unknown, filters: unknown): Promise<CatalogConfigResponse> {
    return productsRepository.upsertCatalogConfig(categories, filters);
  }

  // ── Admin Image Management ────────────────────────

  async uploadProductImage(buffer: Buffer): Promise<{ url: string }> {
    const optimized = await imageOptimizerService.optimizeProductImage(buffer);
    const { url } = await fileStorageService.saveProductImage('temp', optimized);
    return { url };
  }

  async deleteProductImage(url: string): Promise<void> {
    await fileStorageService.deleteProductImage(url);
  }

  // ── Private Helpers ───────────────────────────────

  private async cleanupProductImages(images: string[]): Promise<void> {
    for (const imageUrl of images) {
      try {
        await fileStorageService.deleteProductImage(imageUrl);
      } catch (error) {
        // Log but don't fail the delete operation if image cleanup fails
        logger.warn({ err: error, msg: 'Failed to clean up product image', imageUrl });
      }
    }
  }
}

export const productsService = new ProductsService();
