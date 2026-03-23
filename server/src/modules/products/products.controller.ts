/**
 * Products Controller
 *
 * Request handlers for product and catalog endpoints.
 */

import type { FastifyRequest, FastifyReply } from 'fastify';
import { productsService } from './products.service.js';
import { BadRequestError } from '@shared/errors/errors.js';
import { successResponse } from '@shared/responses/successResponse.js';
import { paginatedResponse } from '@shared/responses/paginatedResponse.js';
import { validateImageFile, validateFileSize } from '@libs/storage/file-validator.js';
import { validateVideoFile, validateVideoFileSize } from '@libs/storage/video-validator.js';
import {
  CatalogQuerySchema,
  SpecValuesQuerySchema,
  PriceRangeQuerySchema,
  SlugOrIdParamSchema,
  ProductIdParamSchema,
  CreateProductSchema,
  UpdateProductSchema,
  CatalogConfigSchema,
  AdminProductsQuerySchema,
  BatchToggleSchema,
  BatchDeleteSchema,
  DeleteImageSchema,
  DeleteVideoSchema,
} from './products.schemas.js';
import type { SortOption } from './products.types.js';

class ProductsController {
  // ── Public Endpoints ──────────────────────────────

  async getCatalog(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const query = CatalogQuerySchema.parse(request.query);

    // Parse JSON string params
    const subcategorySpecFilter = query.subcategorySpecFilter
      ? JSON.parse(query.subcategorySpecFilter) as { kaKey: string; value: string }
      : undefined;
    const specs = query.specs
      ? JSON.parse(query.specs) as Record<string, string[]>
      : undefined;

    const result = await productsService.getFilteredProducts({
      category: query.category,
      subcategorySpecFilter,
      specs,
      search: query.search,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      hasDiscount: query.hasDiscount,
      inStock: query.inStock,
      sort: query.sort as SortOption,
      page: query.page,
      limit: query.limit,
      locale: query.locale,
    });

    return reply.send(paginatedResponse(
      'Products retrieved successfully',
      result.items,
      query.page,
      query.limit,
      result.totalItems,
    ));
  }

  async getCatalogConfig(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const config = await productsService.getCatalogConfig();
    return reply.send(successResponse('Catalog config retrieved successfully', config));
  }

  async getSpecValues(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const query = SpecValuesQuerySchema.parse(request.query);

    const subcategorySpecFilter = query.subcategorySpecFilter
      ? JSON.parse(query.subcategorySpecFilter) as { kaKey: string; value: string }
      : undefined;

    const specValues = await productsService.getSpecValues(
      query.category,
      subcategorySpecFilter,
    );

    return reply.send(successResponse('Spec values retrieved successfully', specValues));
  }

  async getPriceRange(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const query = PriceRangeQuerySchema.parse(request.query);

    const subcategorySpecFilter = query.subcategorySpecFilter
      ? JSON.parse(query.subcategorySpecFilter) as { kaKey: string; value: string }
      : undefined;

    const priceRange = await productsService.getPriceRange(
      query.category,
      subcategorySpecFilter,
    );

    return reply.send(successResponse('Price range retrieved successfully', priceRange));
  }

  async getCategoryCounts(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const counts = await productsService.getCategoryCounts();
    return reply.send(successResponse('Category counts retrieved successfully', counts));
  }

  async getFeatured(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const products = await productsService.getFeaturedProducts();
    return reply.send(successResponse('Featured products retrieved successfully', products));
  }

  async getBySlugOrId(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { slugOrId } = SlugOrIdParamSchema.parse(request.params);
    const product = await productsService.getProductBySlugOrId(slugOrId);
    return reply.send(successResponse('Product retrieved successfully', product));
  }

  async getRelated(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { slugOrId } = SlugOrIdParamSchema.parse(request.params);
    const related = await productsService.getRelatedProducts(slugOrId);
    return reply.send(successResponse('Related products retrieved successfully', related));
  }

  // ── Admin Endpoints ───────────────────────────────

  async getAll(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { page, limit, isActive, inStock, category, search } = AdminProductsQuerySchema.parse(request.query);
    const result = await productsService.getAllProducts(page, limit, { isActive, inStock, category, search });
    return reply.send(paginatedResponse(
      'Products retrieved successfully',
      result.items,
      page,
      limit,
      result.totalItems,
    ));
  }

  async toggleActive(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = ProductIdParamSchema.parse(request.params);
    const product = await productsService.toggleProductActive(id);
    return reply.send(successResponse('Product status toggled successfully', product));
  }

  async batchToggle(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { ids, isActive } = BatchToggleSchema.parse(request.body);
    const count = await productsService.batchToggleActive(ids, isActive);
    return reply.send(successResponse(`${count} products updated successfully`, { count }));
  }

  async batchDelete(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { ids } = BatchDeleteSchema.parse(request.body);
    const count = await productsService.batchDeleteProducts(ids);
    return reply.send(successResponse(`${count} products deleted successfully`, { count }));
  }

  async createProduct(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const input = CreateProductSchema.parse(request.body);
    const product = await productsService.createProduct(input);
    return reply.status(201).send(successResponse('Product created successfully', product));
  }

  async updateProduct(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = ProductIdParamSchema.parse(request.params);
    const input = UpdateProductSchema.parse(request.body);
    const product = await productsService.updateProduct(id, input);
    return reply.send(successResponse('Product updated successfully', product));
  }

  async deleteProduct(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = ProductIdParamSchema.parse(request.params);
    await productsService.deleteProduct(id);
    return reply.send(successResponse('Product deleted successfully', null));
  }

  async updateCatalogConfig(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { categories, filters } = CatalogConfigSchema.parse(request.body);
    const config = await productsService.updateCatalogConfig(categories, filters);
    return reply.send(successResponse('Catalog config updated successfully', config));
  }

  async getSpecSuggestions(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const suggestions = await productsService.getSpecSuggestions();
    return reply.send(successResponse('Spec suggestions retrieved successfully', suggestions));
  }

  async getCategories(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const categories = await productsService.getCategories();
    return reply.send(successResponse('Categories retrieved successfully', categories));
  }

  async uploadProductImage(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const file = await request.file();
    if (!file) {
      throw new BadRequestError('No file uploaded', 'NO_FILE');
    }

    validateImageFile(file);
    const buffer = await file.toBuffer();
    validateFileSize(buffer);

    const result = await productsService.uploadProductImage(buffer);
    return reply.status(201).send(successResponse('Image uploaded successfully', result));
  }

  async deleteProductImage(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { url } = DeleteImageSchema.parse(request.body);
    await productsService.deleteProductImage(url);
    return reply.send(successResponse('Image deleted successfully', null));
  }

  async uploadProductVideo(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const file = await request.file();
    if (!file) {
      throw new BadRequestError('No file uploaded', 'NO_FILE');
    }

    validateVideoFile(file);
    const buffer = await file.toBuffer();
    validateVideoFileSize(buffer);

    const extension = '.' + file.filename.split('.').pop()!.toLowerCase();
    const result = await productsService.uploadProductVideo(buffer, extension);
    return reply.status(201).send(successResponse('Video uploaded successfully', result));
  }

  async deleteProductVideo(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { url } = DeleteVideoSchema.parse(request.body);
    await productsService.deleteProductVideo(url);
    return reply.send(successResponse('Video deleted successfully', null));
  }
}

export const productsController = new ProductsController();
