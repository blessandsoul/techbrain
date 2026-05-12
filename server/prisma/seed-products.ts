/**
 * Seed Script — Products and Product Images
 *
 * Reads product JSON files from the reference project, creates DB records,
 * and copies product images into the structured uploads directory.
 *
 * Categories and catalog config are owned by `seed.ts`. This script assumes
 * those rows already exist and looks them up by slug. Run `npm run prisma:seed`
 * first if categories are missing.
 *
 * Usage: npx tsx prisma/seed-products.ts
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { OLD_TO_NEW_SLUG } from './category-tree.js';

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Paths ───────────────────────────────────────────────

const REFERENCE_ROOT = path.resolve(__dirname, '../../reference/client');
const PRODUCTS_JSON_DIR = path.join(REFERENCE_ROOT, 'public/data/products');
const PRODUCTS_IMAGES_DIR = path.join(REFERENCE_ROOT, 'public/images/products');
const UPLOADS_PRODUCTS_DIR = path.resolve(__dirname, '../uploads/products');

// ── Reference product JSON shape ────────────────────────

interface RefProduct {
  id: string;
  slug: string;
  category: string;
  price: number;
  originalPrice?: number;
  currency: string;
  isActive: boolean;
  isFeatured: boolean;
  images: string[];
  name: { ka: string; ru: string; en: string };
  description: { ka: string; ru: string; en: string };
  specs: Array<{ key: { ka: string; ru: string; en: string }; value: string }>;
  relatedProducts?: string[];
  createdAt: string;
}

// ── Helpers ─────────────────────────────────────────────

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyImageToStructuredDir(
  imageFilename: string,
  categorySlug: string,
  productSlug: string,
): string {
  const sourcePath = path.join(PRODUCTS_IMAGES_DIR, imageFilename);
  const targetDir = path.join(UPLOADS_PRODUCTS_DIR, categorySlug, productSlug);
  const targetPath = path.join(targetDir, imageFilename);
  const relativePath = `${categorySlug}/${productSlug}/${imageFilename}`;

  if (!fs.existsSync(sourcePath)) {
    console.warn(`  [WARN] Image not found: ${sourcePath}`);
    return relativePath;
  }

  ensureDir(targetDir);

  if (!fs.existsSync(targetPath)) {
    fs.copyFileSync(sourcePath, targetPath);
  }

  return relativePath;
}

// ── Main ────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('=== Seeding Products ===\n');

  // 1. Look up existing categories (seeded by prisma/seed.ts)
  console.log('1. Loading categories from DB...');
  const allCats = await prisma.category.findMany({ select: { id: true, slug: true } });
  if (allCats.length === 0) {
    throw new Error('No categories in DB. Run `npm run prisma:seed` first to create the category tree.');
  }
  const categoryMap = new Map(allCats.map((c) => [c.slug, c.id]));
  console.log(`  ✓ Loaded ${allCats.length} categories`);

  // 2. Read all product JSON files and deduplicate slugs
  console.log('\n2. Reading product JSON files...');
  const jsonFiles = fs.readdirSync(PRODUCTS_JSON_DIR).filter((f) => f.endsWith('.json'));
  console.log(`  Found ${jsonFiles.length} product files`);

  // Read all products and deduplicate slugs
  const allProducts: RefProduct[] = [];
  const slugCounts = new Map<string, number>();

  for (const file of jsonFiles) {
    const filePath = path.join(PRODUCTS_JSON_DIR, file);
    const raw = fs.readFileSync(filePath, 'utf-8');
    const product: RefProduct = JSON.parse(raw);

    const count = slugCounts.get(product.slug) ?? 0;
    slugCounts.set(product.slug, count + 1);
    if (count > 0) {
      // Append numeric suffix to make slug unique
      product.slug = `${product.slug}-${count + 1}`;
    }

    allProducts.push(product);
  }

  const dupes = [...slugCounts.entries()].filter(([, c]) => c > 1);
  if (dupes.length > 0) {
    console.log(`  Deduplicated ${dupes.length} slugs: ${dupes.map(([s, c]) => `${s}(${c})`).join(', ')}`);
  }

  // 3. Ensure uploads directory exists
  ensureDir(UPLOADS_PRODUCTS_DIR);

  // 4. Clear existing products (clean seed)
  console.log('\n3. Clearing existing products...');
  await prisma.productSpec.deleteMany({});
  await prisma.productCategory.deleteMany({});
  await prisma.product.deleteMany({});
  console.log('  ✓ Cleared');

  // 5. Seed each product
  console.log('\n4. Seeding products...');
  let created = 0;
  let errors = 0;

  for (const product of allProducts) {
    try {
      // Reference JSON uses legacy slugs; remap them to the new tree.
      const targetSlug =
        OLD_TO_NEW_SLUG[product.category] ?? (categoryMap.has(product.category) ? product.category : null);
      const categoryId = targetSlug ? categoryMap.get(targetSlug) : undefined;
      if (!categoryId || !targetSlug) {
        console.warn(`  [WARN] Unknown category "${product.category}" for ${product.id}, skipping`);
        errors++;
        continue;
      }

      // Copy images and build relative paths (use the legacy folder name on disk)
      const imagePaths = product.images.map((img) =>
        copyImageToStructuredDir(img, product.category, product.slug),
      );

      // Create product
      await prisma.product.create({
        data: {
          id: product.id,
          slug: product.slug,
          price: product.price,
          originalPrice: product.originalPrice ?? null,
          currency: product.currency || 'GEL',
          isActive: product.isActive,
          isFeatured: product.isFeatured,
          images: imagePaths,
          nameKa: product.name.ka,
          nameRu: product.name.ru || '',
          nameEn: product.name.en || '',
          descriptionKa: product.description?.ka ?? null,
          descriptionRu: product.description?.ru ?? null,
          descriptionEn: product.description?.en ?? null,
          relatedProducts: product.relatedProducts ?? undefined,
          createdAt: new Date(product.createdAt),
          categories: {
            create: [{ categoryId }],
          },
          specs: {
            create: product.specs.map((s) => ({
              keyKa: s.key.ka,
              keyRu: s.key.ru || '',
              keyEn: s.key.en || '',
              value: s.value,
            })),
          },
        },
      });
      created++;

      console.log(`  ✓ ${product.id} (${product.slug}) [${product.category} → ${targetSlug}] — ${imagePaths.length} images`);
    } catch (err) {
      console.error(`  ✗ Error seeding ${product.id}:`, err);
      errors++;
    }
  }

  console.log(`\n  Products: ${created} created, ${errors} errors`);

  // 5. Summary
  const totalProducts = await prisma.product.count();
  const totalSpecs = await prisma.productSpec.count();
  const totalCategories = await prisma.category.count();
  const totalLinks = await prisma.productCategory.count();

  console.log('\n=== Seed Summary ===');
  console.log(`  Categories:     ${totalCategories}`);
  console.log(`  Products:       ${totalProducts}`);
  console.log(`  Product specs:  ${totalSpecs}`);
  console.log(`  Category links: ${totalLinks}`);
  console.log(`  Catalog config: ✓`);
  console.log('');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
