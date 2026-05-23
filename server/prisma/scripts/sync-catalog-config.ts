/**
 * Sync the catalog_config singleton with the current category tree + filters
 * (including the controlled-vocabulary option lists). Idempotent and SAFE:
 * it does NOT touch categories, products, or product_categories.
 *
 * Run after deploying a change to CATALOG_FILTERS / CATALOG_CATEGORIES_TREE so
 * the stored config picks up new filter options.
 *
 * Run: npx tsx prisma/scripts/sync-catalog-config.ts
 */

import { PrismaClient } from '@prisma/client';
import { CATALOG_CATEGORIES_TREE, CATALOG_FILTERS } from '../category-tree.js';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('=== Sync catalog_config ===\n');

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

  const filterKeys = Object.keys(CATALOG_FILTERS);
  const withOptions = Object.values(CATALOG_FILTERS)
    .flat()
    .filter((f) => (f.options?.length ?? 0) > 0).length;

  console.log(`  ✓ Wrote catalog_config`);
  console.log(`    Categories in tree: ${CATALOG_CATEGORIES_TREE.length} root(s)`);
  console.log(`    Filter sets:        ${filterKeys.length}`);
  console.log(`    Filters w/ options: ${withOptions}`);
}

main()
  .catch((err) => {
    console.error('Sync failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
