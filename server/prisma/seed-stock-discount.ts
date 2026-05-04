/**
 * Seed Patch — Mark a sample of products as discounted and/or out of stock
 *
 * Picks a deterministic slice of existing non-service products and sets
 * `originalPrice` (creating a discount) and/or `inStock = false`. Idempotent —
 * safe to run multiple times.
 *
 * Usage: npx tsx prisma/seed-stock-discount.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DISCOUNT_RATIO = 1.25;

async function main(): Promise<void> {
  const servicesCategory = await prisma.category.findUnique({ where: { slug: 'services' } });

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(servicesCategory
        ? { categories: { none: { categoryId: servicesCategory.id } } }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: { id: true, slug: true, price: true, originalPrice: true, inStock: true },
  });

  if (products.length === 0) {
    console.log('No products found. Seed products first.');
    return;
  }

  console.log(`Found ${products.length} candidate products.\n`);

  // Indices 0..5 get a discount, indices 4..7 go out of stock.
  // Overlap at 4 and 5: discounted AND out of stock.
  const discountIdx = new Set([0, 1, 2, 3, 4, 5]);
  const outOfStockIdx = new Set([4, 5, 6, 7]);

  let discounted = 0;
  let outOfStock = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const wantDiscount = discountIdx.has(i);
    const wantOos = outOfStockIdx.has(i);

    const data: { originalPrice?: number; inStock?: boolean } = {};

    if (wantDiscount && (p.originalPrice == null || p.originalPrice <= p.price)) {
      data.originalPrice = Math.round(p.price * DISCOUNT_RATIO);
    }
    if (wantOos && p.inStock !== false) {
      data.inStock = false;
    }

    if (Object.keys(data).length === 0) {
      console.log(`  ~ ${p.slug} — already in target state, skipped`);
      continue;
    }

    await prisma.product.update({ where: { id: p.id }, data });

    const tags: string[] = [];
    if (data.originalPrice != null) {
      tags.push(`discount ${p.price}->${data.originalPrice}`);
      discounted++;
    }
    if (data.inStock === false) {
      tags.push('out of stock');
      outOfStock++;
    }
    console.log(`  ✓ ${p.slug} — ${tags.join(', ')}`);
  }

  console.log(`\nUpdated: ${discounted} discounted, ${outOfStock} out of stock.`);
}

main()
  .catch((error) => {
    console.error('Seed patch failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
