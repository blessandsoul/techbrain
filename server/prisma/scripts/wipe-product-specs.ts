/**
 * Wipe ALL product specs (technical attributes). Destructive — products and
 * their categories are untouched, only the product_specs rows are deleted.
 *
 * Used when migrating to the controlled-vocabulary spec system so admins
 * re-enter specs using the canonical option lists.
 *
 * Run: npx tsx prisma/scripts/wipe-product-specs.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const before = await prisma.productSpec.count();
  const { count } = await prisma.productSpec.deleteMany({});
  const after = await prisma.productSpec.count();

  console.log('=== Wipe product specs ===');
  console.log(`  Specs before: ${before}`);
  console.log(`  Deleted:      ${count}`);
  console.log(`  Specs after:  ${after}`);
}

main()
  .catch((err) => {
    console.error('Wipe failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
