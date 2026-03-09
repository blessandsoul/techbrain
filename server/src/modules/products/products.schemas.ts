/**
 * Products Module — Zod Schemas
 */

import { z } from 'zod';

// ── Param Schemas ───────────────────────────────────────

export const SlugOrIdParamSchema = z.object({
  slugOrId: z.string().min(1),
});
export type SlugOrIdParam = z.infer<typeof SlugOrIdParamSchema>;

export const ProductIdParamSchema = z.object({
  id: z.string().min(1),
});
export type ProductIdParam = z.infer<typeof ProductIdParamSchema>;

// ── Catalog Query Schemas ───────────────────────────────

export const CatalogQuerySchema = z.object({
  category: z.string().optional(),
  subcategorySpecFilter: z.string().optional(), // JSON string: { kaKey, value }
  specs: z.string().optional(),                 // JSON string: Record<string, string[]>
  search: z.string().max(200).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  hasDiscount: z.coerce.boolean().optional(),
  sort: z.enum(['newest', 'price-asc', 'price-desc', 'name-asc']).default('newest'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  locale: z.enum(['ka', 'ru', 'en']).default('ka'),
});
export type CatalogQuery = z.infer<typeof CatalogQuerySchema>;

export const SpecValuesQuerySchema = z.object({
  category: z.string().optional(),
  subcategorySpecFilter: z.string().optional(), // JSON string: { kaKey, value }
});
export type SpecValuesQuery = z.infer<typeof SpecValuesQuerySchema>;

export const PriceRangeQuerySchema = z.object({
  category: z.string().optional(),
  subcategorySpecFilter: z.string().optional(), // JSON string: { kaKey, value }
});
export type PriceRangeQuery = z.infer<typeof PriceRangeQuerySchema>;

// ── Localized String Schema ─────────────────────────────

const LocalizedStringSchema = z.object({
  ka: z.string().min(1),
  ru: z.string().default(''),
  en: z.string().default(''),
});

const LocalizedStringPartialSchema = z.object({
  ka: z.string().optional(),
  ru: z.string().optional(),
  en: z.string().optional(),
});

const SpecInputSchema = z.object({
  key: LocalizedStringSchema,
  value: z.string().min(1),
});

// ── Create / Update Schemas ─────────────────────────────

export const CreateProductSchema = z.object({
  slug: z.string().min(1).max(300).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens'),
  categoryIds: z.array(z.string().uuid()).min(1),
  price: z.number().min(0),
  originalPrice: z.number().min(0).optional(),
  currency: z.string().max(10).default('GEL'),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  images: z.array(z.string()).default([]),
  name: LocalizedStringSchema,
  description: LocalizedStringPartialSchema.optional(),
  content: z.string().optional(),
  relatedProducts: z.array(z.string()).optional(),
  specs: z.array(SpecInputSchema).default([]),
}).refine(
  (data) => !data.originalPrice || data.originalPrice > data.price,
  { message: 'Original price must be greater than current price', path: ['originalPrice'] },
);
export type CreateProductInput = z.infer<typeof CreateProductSchema>;

export const UpdateProductSchema = z.object({
  slug: z.string().min(1).max(300).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens').optional(),
  categoryIds: z.array(z.string().uuid()).min(1).optional(),
  price: z.number().min(0).optional(),
  originalPrice: z.number().min(0).nullable().optional(),
  currency: z.string().max(10).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  images: z.array(z.string()).optional(),
  name: LocalizedStringPartialSchema.optional(),
  description: LocalizedStringPartialSchema.optional(),
  content: z.string().nullable().optional(),
  relatedProducts: z.array(z.string()).nullable().optional(),
  specs: z.array(SpecInputSchema).optional(),
}).refine(
  (data) => {
    if (data.originalPrice == null || data.price == null) return true;
    return data.originalPrice > data.price;
  },
  { message: 'Original price must be greater than current price', path: ['originalPrice'] },
);
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;

const CatalogCategorySchema: z.ZodType = z.lazy(() =>
  z.object({
    id: z.string().min(1, 'Category ID is required'),
    parentCategory: z.string().nullable(),
    label: z.object({
      ka: z.string().min(1, 'Georgian label is required'),
      ru: z.string().default(''),
      en: z.string().default(''),
    }),
    specFilter: z.object({ kaKey: z.string(), value: z.string() }).optional(),
    children: z.array(z.lazy(() => CatalogCategorySchema)).optional(),
  }),
);

const CatalogFilterSchema = z.object({
  id: z.string().min(1, 'Filter ID is required'),
  specKaKey: z.string().min(1, 'Spec key is required'),
  label: z.object({
    ka: z.string().min(1, 'Georgian label is required'),
    ru: z.string().default(''),
    en: z.string().default(''),
  }),
  priority: z.number().int().min(1),
  defaultExpanded: z.boolean().optional(),
});

export const CatalogConfigSchema = z.object({
  categories: z.array(CatalogCategorySchema).min(1, 'At least one category is required'),
  filters: z.record(z.string(), z.array(CatalogFilterSchema)),
});
export type CatalogConfigInput = z.infer<typeof CatalogConfigSchema>;

// ── Admin Query Schemas ─────────────────────────────────

export const AdminProductsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  isActive: z.enum(['true', 'false']).optional().transform((v) =>
    v === 'true' ? true : v === 'false' ? false : undefined,
  ),
  category: z.string().optional(),
  search: z.string().max(200).optional(),
});
export type AdminProductsQuery = z.infer<typeof AdminProductsQuerySchema>;

export const BatchToggleSchema = z.object({
  ids: z.array(z.string().min(1)).min(1).max(100),
  isActive: z.boolean(),
});
export type BatchToggleInput = z.infer<typeof BatchToggleSchema>;

export const BatchDeleteSchema = z.object({
  ids: z.array(z.string().min(1)).min(1).max(100),
});
export type BatchDeleteInput = z.infer<typeof BatchDeleteSchema>;

export const DeleteImageSchema = z.object({
  url: z.string().startsWith('/uploads/products/'),
});
export type DeleteImageInput = z.infer<typeof DeleteImageSchema>;
