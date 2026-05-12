/**
 * One-time data migration — replace categories with the new hierarchy.
 *
 * Run ONCE on production after `prisma migrate deploy` adds the `parent_id`
 * column. Preserves existing products by remapping their category links from
 * old slugs to the closest new slugs (see OLD_TO_NEW_SLUG).
 *
 * Steps:
 *   1. Snapshot existing product→category links (productId, old slug).
 *   2. Delete all rows from `categories` — cascades to `product_categories`.
 *   3. Insert the new hierarchical category rows.
 *   4. Re-create product→category links using OLD_TO_NEW_SLUG mapping.
 *   5. Upsert `catalog_config` with the new tree + filter map.
 *
 * Run: pnpm tsx prisma/scripts/replace-categories.ts
 */

import { PrismaClient } from '@prisma/client';
import {
  CATEGORY_TREE,
  CATALOG_CATEGORIES_TREE,
  CATALOG_FILTERS,
  OLD_TO_NEW_SLUG,
} from '../category-tree.js';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('=== Replace Categories Migration ===\n');

  // 1. Snapshot existing product→category links with old slugs
  console.log('1. Snapshotting existing product→category links...');
  const links = await prisma.productCategory.findMany({
    include: { category: { select: { slug: true } } },
  });
  console.log(`   Found ${links.length} product↔category links across ${new Set(links.map((l) => l.productId)).size} products`);

  const productSlugPairs = links.map((l) => ({ productId: l.productId, oldSlug: l.category.slug }));

  // 2. Delete all old categories (cascade clears product_categories)
  console.log('\n2. Deleting old categories (cascades to product_categories)...');
  const { count: deleted } = await prisma.category.deleteMany({});
  console.log(`   Deleted ${deleted} category rows`);

  // 3. Insert the new hierarchical tree (parents before children)
  console.log('\n3. Inserting new category tree...');
  const slugToId = new Map<string, string>();
  for (const cat of CATEGORY_TREE) {
    const parentId = cat.parentSlug ? slugToId.get(cat.parentSlug) ?? null : null;
    const row = await prisma.category.create({
      data: {
        slug: cat.slug,
        parentId,
        nameKa: cat.nameKa,
        nameRu: cat.nameRu,
        nameEn: cat.nameEn,
        sortOrder: cat.sortOrder,
      },
    });
    slugToId.set(cat.slug, row.id);
    console.log(`   ✓ ${cat.slug}${cat.parentSlug ? `  (parent: ${cat.parentSlug})` : ''}`);
  }

  // 4. Remap product links: old slug → new slug → new category id
  console.log('\n4. Remapping product→category links...');
  let remapped = 0;
  let dropped = 0;
  const seenPairs = new Set<string>();
  for (const { productId, oldSlug } of productSlugPairs) {
    const newSlug = OLD_TO_NEW_SLUG[oldSlug];
    if (!newSlug) {
      dropped++;
      continue;
    }
    const newCategoryId = slugToId.get(newSlug);
    if (!newCategoryId) {
      dropped++;
      continue;
    }
    const dedupeKey = `${productId}:${newCategoryId}`;
    if (seenPairs.has(dedupeKey)) continue;
    seenPairs.add(dedupeKey);

    await prisma.productCategory.create({
      data: { productId, categoryId: newCategoryId },
    });
    remapped++;
  }
  console.log(`   Remapped ${remapped} links, dropped ${dropped} (unmapped old slug)`);

  // 5. Upsert catalog config
  console.log('\n5. Upserting catalog_config singleton...');
  await prisma.catalogConfig.upsert({
    where: { id: 'singleton' },
    update: {
      categories: CATALOG_CATEGORIES_TREE as unknown as object,
      filters: CATALOG_FILTERS as unknown as object,
    },
    create: {
      id: 'singleton',
      categories: CATALOG_CATEGORIES_TREE as unknown as object,
      filters: CATALOG_FILTERS as unknown as object,
    },
  });
  console.log('   ✓ Catalog config written');

  // 6. Summary
  const totalCats = await prisma.category.count();
  const totalLinks = await prisma.productCategory.count();
  const uncategorisedProducts = await prisma.product.count({
    where: { categories: { none: {} } },
  });
  console.log('\n=== Summary ===');
  console.log(`  Categories now:        ${totalCats}`);
  console.log(`  Product↔category rows: ${totalLinks}`);
  console.log(`  Uncategorised products: ${uncategorisedProducts}`);
  if (uncategorisedProducts > 0) {
    console.log(`  → Open /admin and assign categories to these products manually.`);
  }
}

main()
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
